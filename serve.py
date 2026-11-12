#!/usr/bin/env python3
"""Local site server. Serves the portfolio and saves editor changes."""

import cgi
import json
import re
import shutil
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8765
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
IMAGE_FILE = re.compile(r"^(cover|\d{2})\.(jpg|jpeg|png|webp)$", re.IGNORECASE)
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGE = 12 * 1024 * 1024
MAX_REQUEST = 48 * 1024 * 1024
COVER_CDN = "cdn.myportfolio.com"
COVER_SITE = "8db36b1a-d8c5-40b4-a9ac-55a415596453"
HEADER = """// Copied from the Adobe Portfolio editor. Images are not included.
// For a project, add files in images/<slug>/:
//   cover.jpg (or .png / .webp) for the card
//   01.jpg, 02.jpg, ... for the project page
// Optional project fields: summary, role, year, link.
"""


def read_site():
    text = (ROOT / "data.js").read_text(encoding="utf-8")
    payload = text.split("const SITE = ", 1)[1].strip()
    if payload.endswith(";"):
        payload = payload[:-1]
    return json.loads(payload)


def write_site(site):
    if not isinstance(site, dict):
        raise ValueError("Site must be an object")
    for key in ("name", "tagline", "links", "welcome", "sections", "projects"):
        if key not in site:
            raise ValueError(f"Missing {key}")
    slugs = set()
    for section in site["sections"]:
        if not SLUG.match(section.get("id", "")):
            raise ValueError("Section id must be a slug")
        for slug in section.get("projects", []):
            if slug not in site["projects"] or not SLUG.match(slug):
                raise ValueError(f"Unknown project {slug}")
            slugs.add(slug)
            (ROOT / "images" / slug).mkdir(parents=True, exist_ok=True)
    extras = set(site["projects"]) - slugs
    if extras:
        raise ValueError("Every project must belong to a section")
    body = json.dumps(site, indent=2, ensure_ascii=False)
    (ROOT / "data.js").write_text(f"{HEADER}const SITE = {body};\n", encoding="utf-8")


def project_dir(slug, must_exist_in_site=True):
    if not SLUG.match(slug or ""):
        raise ValueError("Invalid project")
    if must_exist_in_site and slug not in read_site()["projects"]:
        raise ValueError("Unknown project")
    folder = (ROOT / "images" / slug).resolve()
    images_root = (ROOT / "images").resolve()
    if folder.parent != images_root:
        raise ValueError("Invalid project path")
    folder.mkdir(parents=True, exist_ok=True)
    return folder


def sniff_ext(data):
    if data.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if len(data) >= 12 and data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return ".webp"
    raise ValueError("Only JPEG, PNG, and WebP images are allowed")


def image_files(folder):
    return [
        path
        for path in folder.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_EXTS and IMAGE_FILE.match(path.name)
    ]


def cover_file(folder):
    covers = [path for path in image_files(folder) if path.stem.lower() == "cover"]
    return covers[0] if covers else None


def gallery_files(folder):
    return sorted(
        (path for path in image_files(folder) if path.stem.lower() != "cover"),
        key=lambda path: path.name.lower(),
    )


def image_record(slug):
    folder = ROOT / "images" / slug
    if not folder.is_dir():
        cover = None
        gallery = []
    else:
        cover_path = cover_file(folder)
        cover = cover_path.name if cover_path else None
        gallery = [path.name for path in gallery_files(folder)]
    return {
        "folder": f"images/{slug}/",
        "cover": cover,
        "gallery": gallery,
        "count": (1 if cover else 0) + len(gallery),
        "missingCover": cover is None,
        "missingGallery": len(gallery) == 0,
    }


def image_status():
    return {slug: image_record(slug) for slug in read_site()["projects"]}


def next_gallery_index(folder):
    numbers = [int(path.stem) for path in gallery_files(folder)]
    return (max(numbers) if numbers else 0) + 1


def renumber(folder, ordered_names):
    current = {path.name: path for path in gallery_files(folder)}
    if set(ordered_names) != set(current) or len(ordered_names) != len(current):
        raise ValueError("Order must include every gallery image once")
    staging = []
    for index, name in enumerate(ordered_names):
        source = current[name]
        temporary = folder / f".reorder-{index}{source.suffix.lower()}"
        source.rename(temporary)
        staging.append(temporary)
    for index, temporary in enumerate(staging, start=1):
        extension = ".jpg" if temporary.suffix.lower() == ".jpeg" else temporary.suffix.lower()
        temporary.rename(folder / f"{index:02d}{extension}")


def write_cover(folder, data):
    extension = sniff_ext(data)
    if len(data) > MAX_IMAGE:
        raise ValueError("Each image must be 12 MB or smaller")
    for path in list(folder.glob("cover.*")):
        if path.is_file():
            path.unlink()
    (folder / f"cover{extension}").write_bytes(data)


def add_gallery(folder, blobs):
    index = next_gallery_index(folder)
    for data in blobs:
        extension = sniff_ext(data)
        if len(data) > MAX_IMAGE:
            raise ValueError("Each image must be 12 MB or smaller")
        (folder / f"{index:02d}{extension}").write_bytes(data)
        index += 1


def cover_source(url):
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.netloc != COVER_CDN:
        raise ValueError("Cover link is not from the portfolio")
    if not parsed.path.startswith(f"/{COVER_SITE}/"):
        raise ValueError("Cover link is not from this portfolio")
    if not parsed.path.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
        raise ValueError("Cover link is not an image")
    return url


def download_cover(url):
    request = urllib.request.Request(
        cover_source(url),
        headers={"User-Agent": "Mozilla/5.0", "Accept": "image/png,image/jpeg,image/webp,*/*"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        data = response.read(MAX_IMAGE + 1)
    if len(data) > MAX_IMAGE:
        raise ValueError("Each image must be 12 MB or smaller")
    sniff_ext(data)
    return data


def import_summaries(rows):
    if not isinstance(rows, list):
        raise ValueError("Description list is invalid")
    site = read_site()
    updated, kept, skipped = [], [], []
    for row in rows:
        if not isinstance(row, dict):
            continue
        slug = row.get("slug")
        summary = row.get("summary")
        if not isinstance(slug, str) or not SLUG.match(slug) or slug not in site["projects"]:
            skipped.append(slug)
            continue
        if not isinstance(summary, str) or not summary.strip():
            skipped.append(slug)
            continue
        project = site["projects"][slug]
        if project.get("summary"):
            kept.append(slug)
            continue
        project["summary"] = summary.strip()
        updated.append(slug)
    if updated:
        write_site(site)
    return {"updated": updated, "kept": kept, "skipped": skipped}


def same_description(current, incoming):
    incoming = (incoming or "").strip()
    current = (current or "").strip()
    if not incoming:
        return True
    if not current:
        return False
    left = set(re.findall(r"[a-z0-9]+", current.lower()))
    right = set(re.findall(r"[a-z0-9]+", incoming.lower()))
    if not right:
        return True
    return len(left & right) / len(right) >= 0.75


def import_galleries(rows):
    if not isinstance(rows, list):
        raise ValueError("Gallery list is invalid")
    aliases = {"tangled-hair": "tangled-pair", "soft-cars": "sort-cars"}
    site = read_site()
    projects = site["projects"]
    saved, kept, skipped, failed, described = [], [], [], [], []
    for row in rows:
        if not isinstance(row, dict):
            continue
        raw_slug = row.get("slug")
        slug = aliases.get(raw_slug, raw_slug)
        if not isinstance(slug, str) or not SLUG.match(slug) or slug not in projects:
            skipped.append(raw_slug)
            continue
        summary = row.get("summary")
        if isinstance(summary, str) and len(summary.strip()) >= 20:
            if not same_description(projects[slug].get("summary"), summary):
                projects[slug]["summary"] = summary.strip()
                described.append(slug)
        images = row.get("images")
        if not isinstance(images, list) or not images:
            continue
        folder = project_dir(slug)
        if gallery_files(folder):
            kept.append(slug)
            continue
        cover = cover_file(folder)
        cover_data = cover.read_bytes() if cover else None
        seen = []
        for src in images:
            if isinstance(src, str) and src not in seen:
                seen.append(src)

        def fetch_image(src):
            try:
                return download_cover(src)
            except Exception as error:
                return error

        with ThreadPoolExecutor(max_workers=6) as pool:
            downloaded = list(pool.map(fetch_image, seen))
        blobs = []
        for data in downloaded:
            if isinstance(data, Exception):
                failed.append({"slug": slug, "error": str(data)})
                continue
            if cover_data is not None and data == cover_data:
                continue
            blobs.append(data)
        if not blobs:
            skipped.append(slug)
            continue
        try:
            add_gallery(folder, blobs)
            saved.append({"slug": slug, "count": len(blobs)})
        except Exception as error:
            failed.append({"slug": slug, "error": str(error)})
    if described:
        write_site(site)
    return {
        "saved": saved,
        "kept": kept,
        "skipped": skipped,
        "failed": failed,
        "described": described,
    }


def import_covers(rows):
    if not isinstance(rows, list):
        raise ValueError("Cover list is invalid")
    chosen = {}
    for row in rows:
        if not isinstance(row, dict):
            continue
        slug = row.get("slug")
        src = row.get("src")
        if isinstance(slug, str) and isinstance(src, str) and SLUG.match(slug):
            chosen[slug] = src
    projects = read_site()["projects"]
    saved, kept, skipped, failed = [], [], [], []
    for slug, src in chosen.items():
        if slug not in projects:
            skipped.append(slug)
            continue
        folder = project_dir(slug)
        if cover_file(folder) is not None:
            kept.append(slug)
            continue
        try:
            write_cover(folder, download_cover(src))
            saved.append(slug)
        except Exception as error:
            failed.append({"slug": slug, "error": str(error)})
    return {"saved": saved, "kept": kept, "skipped": skipped, "failed": failed}


def read_upload(item):
    data = item.file.read(MAX_IMAGE + 1)
    if len(data) > MAX_IMAGE:
        raise ValueError("Each image must be 12 MB or smaller")
    if not data:
        raise ValueError("An uploaded image was empty")
    return data


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if urlparse(self.path).path == "/api/images":
            self._json(200, image_status())
            return
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        length = int(self.headers.get("Content-Length", "0"))
        if length > MAX_REQUEST:
            self._json(413, {"error": "Upload is too large"})
            return
        try:
            if path == "/api/site":
                site = json.loads(self.rfile.read(length).decode("utf-8"))
                current = read_site()["projects"]
                incoming = site.get("projects") if isinstance(site, dict) else None
                if isinstance(current, dict) and isinstance(incoming, dict):
                    removed = [slug for slug in current if slug not in incoming]
                    if len(removed) > 5:
                        self._json(409, {
                            "error": f"Save would remove {len(removed)} projects. Refresh the editor, then save again."
                        })
                        return
                write_site(site)
                self._json(200, {"ok": True})
                return
            if path == "/api/import-galleries":
                rows = json.loads(self.rfile.read(length).decode("utf-8"))
                self._json(200, import_galleries(rows))
                return
            if path == "/api/import-covers":
                rows = json.loads(self.rfile.read(length).decode("utf-8"))
                self._json(200, import_covers(rows))
                return
            if path == "/api/import-summaries":
                rows = json.loads(self.rfile.read(length).decode("utf-8"))
                self._json(200, import_summaries(rows))
                return
            if path == "/api/dump":
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                Path("/tmp/adobe-dump.json").write_text(
                    json.dumps(payload, ensure_ascii=False, indent=2),
                    encoding="utf-8",
                )
                self._json(200, {"ok": True})
                return
            parts = [unquote(part) for part in path.strip("/").split("/")]
            if len(parts) == 3 and parts[:2] == ["api", "images"]:
                self._upload(parts[2])
                return
            if len(parts) == 4 and parts[:2] == ["api", "images"] and parts[3] == "order":
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                self._reorder(parts[2], payload.get("order"))
                return
            if len(parts) == 4 and parts[:2] == ["api", "images"] and parts[3] == "cover":
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                self._set_cover(parts[2], payload.get("file"))
                return
        except Exception as error:
            self._json(400, {"error": str(error)})
            return
        self.send_error(404)

    def do_DELETE(self):
        parts = [unquote(part) for part in urlparse(self.path).path.strip("/").split("/")]
        try:
            if len(parts) == 3 and parts[:2] == ["api", "images"]:
                self._delete_folder(parts[2])
                return
            if len(parts) == 4 and parts[:2] == ["api", "images"]:
                self._delete_file(parts[2], parts[3])
                return
        except Exception as error:
            self._json(400, {"error": str(error)})
            return
        self.send_error(404)

    def _upload(self, slug):
        folder = project_dir(slug)
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={
                "REQUEST_METHOD": "POST",
                "CONTENT_TYPE": self.headers.get("Content-Type", ""),
                "CONTENT_LENGTH": self.headers.get("Content-Length", "0"),
            },
        )
        target = form.getvalue("target") or "gallery"
        if isinstance(target, list):
            target = target[0]
        if target not in ("cover", "gallery"):
            raise ValueError("Choose a cover or gallery upload")
        field = form["files"] if "files" in form else None
        items = field if isinstance(field, list) else ([field] if field is not None else [])
        items = [item for item in items if getattr(item, "filename", None)]
        if not items:
            raise ValueError("Choose at least one image")
        blobs = [read_upload(item) for item in items]
        if target == "cover":
            if len(blobs) != 1:
                raise ValueError("Choose one image for the cover")
            write_cover(folder, blobs[0])
        else:
            if cover_file(folder) is None and blobs:
                write_cover(folder, blobs[0])
                blobs = blobs[1:]
            if blobs:
                add_gallery(folder, blobs)
        self._json(200, image_record(slug))

    def _reorder(self, slug, order):
        if not isinstance(order, list) or not all(isinstance(name, str) for name in order):
            raise ValueError("Image order is invalid")
        if any(not IMAGE_FILE.match(name) or name.lower().startswith("cover") for name in order):
            raise ValueError("Image order is invalid")
        renumber(project_dir(slug), order)
        self._json(200, image_record(slug))

    def _set_cover(self, slug, name):
        if not isinstance(name, str) or not IMAGE_FILE.match(name) or name.lower().startswith("cover"):
            raise ValueError("Choose a gallery image")
        folder = project_dir(slug)
        source = (folder / name).resolve()
        if source.parent != folder or not source.is_file():
            raise ValueError("Image not found")
        selected = source.read_bytes()
        sniff_ext(selected)
        old = cover_file(folder)
        old_bytes = old.read_bytes() if old else None
        source.unlink()
        if old:
            old.unlink()
        remaining = [path.name for path in gallery_files(folder)]
        if remaining:
            renumber(folder, remaining)
        write_cover(folder, selected)
        if old_bytes:
            add_gallery(folder, [old_bytes])
        self._json(200, image_record(slug))

    def _delete_file(self, slug, name):
        if not IMAGE_FILE.match(name):
            raise ValueError("Image name is invalid")
        folder = project_dir(slug)
        target = (folder / name).resolve()
        if target.parent != folder or not target.is_file():
            raise ValueError("Image not found")
        target.unlink()
        remaining = [path.name for path in gallery_files(folder)]
        if remaining:
            renumber(folder, remaining)
        self._json(200, image_record(slug))

    def _delete_folder(self, slug):
        if not SLUG.match(slug or ""):
            raise ValueError("Invalid project")
        if slug in read_site()["projects"]:
            raise ValueError("Save the project removal before deleting its images")
        folder = (ROOT / "images" / slug).resolve()
        if folder.parent != (ROOT / "images").resolve():
            raise ValueError("Invalid project path")
        if folder.is_dir():
            shutil.rmtree(folder)
        self._json(200, {"ok": True})

    def _json(self, code, payload):
        raw = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"http://{HOST}:{PORT}/")
    print(f"Editor http://{HOST}:{PORT}/editor.html")
    server.serve_forever()
