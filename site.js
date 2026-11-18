const EXTS = ["jpg", "jpeg", "png", "webp"];

const ICONS = {
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.7 3.3A2.2 2.2 0 1 0 4.7 7.7 2.2 2.2 0 0 0 4.7 3.3zM3 9h3.4v12H3zM10 9h3.3v1.7h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5V21H17.7v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H10z"/></svg>',
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.4 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z"/></svg>',
  email:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5v-11zm2.2.3 7.2 5.2c.4.3.9.3 1.2 0l7.2-5.2a.9.9 0 0 0-.3-.8h-15a.9.9 0 0 0-.3.8z"/></svg>',
};

function headOk(url) {
  return fetch(url, { method: "HEAD" }).then(
    (res) => (res.ok ? url : null),
    () => null
  );
}

async function firstExisting(paths) {
  const found = await Promise.all(paths.map(headOk));
  return found.find(Boolean) || null;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function findCover(slug) {
  for (const name of ["cover", "01"]) {
    for (const ext of ["png", "jpg", "jpeg", "webp"]) {
      const src = await loadImage(`images/${slug}/${name}.${ext}`);
      if (src) return src;
    }
  }
  return null;
}

async function galleryPaths(slug) {
  const base = `images/${slug}/`;
  const first = await firstExisting(EXTS.map((ext) => `${base}01.${ext}`));
  if (!first) return [];
  const ext = first.slice(first.lastIndexOf(".") + 1);
  const images = [first];
  let index = 2;
  while (index <= 48) {
    const urls = [];
    for (let number = index; number <= Math.min(index + 11, 48); number += 1) {
      urls.push(`${base}${String(number).padStart(2, "0")}.${ext}`);
    }
    const found = await Promise.all(urls.map(headOk));
    const missing = found.indexOf(null);
    images.push(...(missing === -1 ? found : found.slice(0, missing)));
    if (missing !== -1) break;
    index += 12;
  }
  return images;
}

function sectionFor(slug) {
  return SITE.sections.find((section) => section.projects.includes(slug));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isLocal() {
  return location.hostname === "127.0.0.1" || location.hostname === "localhost";
}

function publicSections() {
  return SITE.sections.filter((section) => section.projects.length > 0);
}

function projectBlocks(project, galleryHtml) {
  const rows = [];
  const paragraphs = (project.summary || "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter((text) => text && !text.startsWith("Keywords"));
  if (paragraphs.length) {
    rows.push(["Description", paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join("")]);
  }
  rows.push(["Gallery", galleryHtml]);

  return rows
    .map(
      ([label, body]) => `
      <section class="block">
        <h2>${label}</h2>
        <div>${body}</div>
      </section>`
    )
    .join("");
}

function renderChrome(currentId) {
  const nav = document.querySelector("#nav");
  const sections = publicSections()
    .map((section) => {
      const current = section.id === currentId ? ' aria-current="page"' : "";
      return `<a href="#/${section.id}"${current}>${escapeHtml(section.title)}</a>`;
    })
    .join("");
  nav.innerHTML = sections;
  document.querySelector(".tagline").textContent =
    "Unity game developer, building gameplay systems since 2021.";

  const social = document.querySelector("#social");
  social.innerHTML = `
    <a href="${SITE.links.linkedin}" aria-label="LinkedIn">${ICONS.linkedin}</a>
    <a href="${SITE.links.github}" aria-label="GitHub">${ICONS.github}</a>
    <a href="mailto:${SITE.links.email}" aria-label="Email">${ICONS.email}</a>
  `;
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function entryMarkup(slug, index) {
  const project = SITE.projects[slug];
  const studio = studioName(project.role);
  const meta = [
    studio ? `<span class="studio">${escapeHtml(studio)}</span>` : "",
    project.year ? `<span class="year">${escapeHtml(project.year)}</span>` : "",
  ].join("");
  return `
    <a class="entry" href="#/${slug}" data-title="${escapeHtml(project.title)}" data-studio="${escapeHtml(studio)}" data-year="${escapeHtml(project.year || "")}" style="--i:${index}">
      <span class="entry-cover placeholder" data-frame="${slug}"></span>
      <span class="entry-title">${escapeHtml(project.title)}</span>
      <span class="entry-meta">${meta}</span>
    </a>`;
}

const BACKDROP_MIN = 232;

async function cutout(src) {
  const image = new Image();
  image.src = src;
  await image.decode();
  const scale = Math.min(1, 640 / image.naturalHeight);
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, width, height);
  const frame = context.getImageData(0, 0, width, height);
  const px = frame.data;
  const isBackdrop = (p) =>
    px[p * 4] > BACKDROP_MIN && px[p * 4 + 1] > BACKDROP_MIN && px[p * 4 + 2] > BACKDROP_MIN;

  const cleared = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x += 1) stack.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y += 1) stack.push(y * width, y * width + width - 1);
  while (stack.length) {
    const p = stack.pop();
    if (cleared[p] || !isBackdrop(p)) continue;
    cleared[p] = 1;
    px[p * 4 + 3] = 0;
    const x = p % width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (p >= width) stack.push(p - width);
    if (p < width * (height - 1)) stack.push(p + width);
  }

  let left = width, right = 0, top = height, bottom = 0;
  for (let p = 0; p < width * height; p += 1) {
    if (cleared[p]) continue;
    const x = p % width;
    const y = (p - x) / width;
    const edge =
      (x > 0 && cleared[p - 1]) || (x < width - 1 && cleared[p + 1]) ||
      (y > 0 && cleared[p - width]) || (y < height - 1 && cleared[p + width]);
    if (edge) {
      const lightest = Math.min(px[p * 4], px[p * 4 + 1], px[p * 4 + 2]);
      px[p * 4 + 3] = 255 - lightest;
      px[p * 4] = px[p * 4 + 1] = px[p * 4 + 2] = 0;
    }
    if (x < left) left = x;
    if (x > right) right = x;
    if (y < top) top = y;
    if (y > bottom) bottom = y;
  }
  if (right <= left || bottom <= top) return src;

  context.putImageData(frame, 0, 0);
  const cropped = document.createElement("canvas");
  cropped.width = right - left + 1;
  cropped.height = bottom - top + 1;
  cropped.getContext("2d").drawImage(canvas, -left, -top);
  const blob = await new Promise((resolve) => cropped.toBlob(resolve, "image/png"));
  return blob ? URL.createObjectURL(blob) : src;
}

const cutouts = new Map();

function cutoutFor(slug) {
  if (!cutouts.has(slug)) {
    cutouts.set(
      slug,
      findCover(slug).then((src) => (src ? cutout(src).catch(() => src) : null))
    );
  }
  return cutouts.get(slug);
}

function loadCovers(slugs) {
  for (const slug of slugs) {
    cutoutFor(slug).then((src) => {
      if (!src) return;
      const frame = document.querySelector(`[data-frame="${slug}"]`);
      if (!frame) return;
      const image = new Image();
      image.alt = "";
      image.onload = () => frame.classList.add("ready");
      image.src = src;
      frame.classList.remove("placeholder");
      frame.replaceChildren(image);
    });
  }
}

function indexMarkup(section, heading = "h2", lead = "") {
  const entries = section.projects.map((slug, index) => entryMarkup(slug, index)).join("");
  const title = `
        <a href="#/${section.id}">${escapeHtml(section.title)}</a>
        <span class="count">${section.projects.length}</span>`;
  const headingHtml =
    heading === "h1"
      ? `<h1 class="index-heading">${title}</h1>`
      : `<h2 class="index-heading">${title}</h2>`;
  return `
    <section class="index-block" id="${section.id}">
      ${headingHtml}
      ${lead}
      <div class="index">${entries}</div>
    </section>`;
}

function studiosOf(slugs) {
  return [...new Set(slugs.map((slug) => studioName(SITE.projects[slug].role)).filter(Boolean))];
}

function yearsOf(slugs) {
  return [...new Set(slugs.map((slug) => SITE.projects[slug].year).filter(Boolean))].sort().reverse();
}

function factsMarkup(sections) {
  const slugs = sections.flatMap((section) => section.projects);
  const facts = [
    [slugs.length, "Games"],
    ...sections.map((section) => [section.projects.length, section.title.replace(/^Mobile /, "")]),
    [studiosOf(slugs).length, "Studios"],
  ];
  return `
    <dl class="facts">
      ${facts
        .map(([value, label]) => `<div><dt>${escapeHtml(label)}</dt><dd data-count="${value}">${value}</dd></div>`)
        .join("")}
    </dl>`;
}

function chipGroup(name, label, values) {
  const chips = ["", ...values]
    .map(
      (value) =>
        `<button type="button" class="chip" data-filter="${name}" data-value="${escapeHtml(value)}" aria-pressed="${value === ""}">${escapeHtml(value || "All")}</button>`
    )
    .join("");
  return `<div class="chip-group" role="group" aria-label="${label}"><span class="chip-label">${label}</span><div class="chips">${chips}</div></div>`;
}

function filtersMarkup(slugs) {
  return `
    <div class="filters">
      <label class="search"><span>Search</span><input type="search" placeholder="Game name" aria-label="Search games"></label>
      ${chipGroup("studio", "Studio", studiosOf(slugs))}
      ${chipGroup("year", "Year", yearsOf(slugs))}
    </div>
    <p class="filter-empty" hidden>No games match.</p>`;
}

const filters = { studio: "", year: "", query: "" };

function applyFilters({ animate = true } = {}) {
  const main = document.querySelector("#main");
  let shown = 0;
  for (const block of main.querySelectorAll(".index-block:not(.about)")) {
    let visible = 0;
    for (const entry of block.querySelectorAll(".entry")) {
      const match =
        (!filters.query || entry.dataset.title.toLowerCase().includes(filters.query)) &&
        (!filters.studio || entry.dataset.studio === filters.studio) &&
        (!filters.year || entry.dataset.year === filters.year);
      entry.hidden = !match;
      if (match) {
        entry.style.setProperty("--i", visible);
        visible += 1;
      }
    }
    block.hidden = visible === 0;
    block.querySelector(".count").textContent = visible;
    shown += visible;
  }
  for (const chip of main.querySelectorAll(".chip")) {
    chip.setAttribute("aria-pressed", String(filters[chip.dataset.filter] === chip.dataset.value));
  }
  const empty = main.querySelector(".filter-empty");
  if (empty) empty.hidden = shown > 0;
  if (!animate) return;
  main.classList.remove("refiltered");
  void main.offsetWidth;
  main.classList.add("refiltered");
}

function countUp() {
  if (reducedMotion) return;
  for (const node of document.querySelectorAll("[data-count]")) {
    const target = Number(node.dataset.count);
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / 900);
      node.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}

let renderToken = 0;

function renderHome() {
  renderToken += 1;
  document.title = SITE.name;
  renderChrome("");
  const indexes = publicSections().map((section) => indexMarkup(section)).join("");
  const blocks = SITE.welcome.blocks
    .map(
      (block) => `
      <section class="block">
        <h2>${escapeHtml(block.label)}</h2>
        <div>${block.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
      </section>`
    )
    .join("");

  const sections = publicSections();
  filters.studio = "";
  filters.year = "";
  filters.query = "";
  document.querySelector("#main").innerHTML = `
    ${factsMarkup(sections)}
    ${filtersMarkup(sections.flatMap((section) => section.projects))}
    ${indexes}
    <section class="index-block about">
      <h2 class="index-heading">About</h2>
      <div class="blocks">${blocks}</div>
    </section>
  `;
  loadCovers(sections.flatMap((section) => section.projects));
  countUp();
}

function studioName(role) {
  if (!role || role.startsWith("Mobile")) return "";
  return role.split(" · ")[0];
}

function renderSection(section) {
  renderToken += 1;
  document.title = `${section.title} — ${SITE.name}`;
  renderChrome(section.id);
  const empty = section.projects.length
    ? ""
    : `<p class="empty-note">No pages in this section yet. Add them in the editor.</p>`;

  filters.studio = "";
  filters.year = "";
  filters.query = "";
  const filterBar = section.projects.length > 1 ? filtersMarkup(section.projects) : "";
  document.querySelector("#main").innerHTML = `
    ${section.projects.length ? indexMarkup(section, "h1", filterBar) : `<h1 class="page-title">${escapeHtml(section.title)}</h1>`}
    ${empty}
    <a class="back" href="#/">← All work</a>
  `;
  loadCovers(section.projects);
}

async function renderProject(slug) {
  const token = (renderToken += 1);
  const project = SITE.projects[slug];
  const section = sectionFor(slug);
  document.title = `${project.title} — ${SITE.name}`;
  renderChrome(section ? section.id : "");
  const back = section
    ? `<a class="back" href="#/${section.id}">← ${escapeHtml(section.title)}</a>`
    : `<a class="back" href="#/">← Home</a>`;
  const credit = [studioName(project.role), project.year].filter(Boolean);
  const paint = (gallery) => {
    document.querySelector("#main").innerHTML = `
      <h1 class="page-title">${escapeHtml(project.title)}</h1>
      ${credit.length ? `<p class="project-meta">${credit.map((part) => escapeHtml(part)).join(" · ")}</p>` : ""}
      <div class="blocks project-copy">${projectBlocks(project, gallery)}</div>
      ${back}
    `;
  };

  paint(`<p class="empty-note">Loading images…</p>`);
  const images = await galleryPaths(slug);
  if (token !== renderToken) return;
  const gallery = images.length
    ? `<div class="gallery">${images
        .map(
          (src) =>
            `<button type="button" class="shot" data-full="${escapeHtml(src)}"><img src="${escapeHtml(src)}" alt="${escapeHtml(project.title)}" decoding="async"></button>`
        )
        .join("")}</div>`
    : `<p class="empty-note">Add the pictures for this page to <code>images/${slug}/</code>. Use <code>cover.jpg</code> for the card and <code>01.jpg</code>, <code>02.jpg</code>, and so on for the page. png and webp work too.</p>`;
  paint(gallery);
}

function route() {
  const path = (location.hash.replace(/^#\/?/, "") || "").split("/")[0];
  if (!path || path === "image-todo") {
    renderHome();
    return;
  }
  const section = SITE.sections.find((item) => item.id === path);
  if (section) {
    if (!section.projects.length && !isLocal()) {
      renderHome();
      return;
    }
    renderSection(section);
    return;
  }
  if (SITE.projects[path]) {
    renderProject(path);
    return;
  }
  renderHome();
}

const lightbox = document.querySelector(".lightbox");
const lightboxTrack = lightbox.querySelector(".lightbox-track");
const lightboxSlides = [...lightbox.querySelectorAll(".lightbox-slide img")];
const lightboxImage = lightbox.querySelector(".lightbox-current");
const lightboxCount = lightbox.querySelector(".lightbox-count");
let lightboxShots = [];
let lightboxIndex = 0;

let lightboxScroll = 0;
let swipe = null;
let ignoreLightboxClick = false;
const SWIPE_DISTANCE = 56;
const TRACK_CENTER = "translateX(-33.333%)";

function shotAt(offset) {
  const index = (lightboxIndex + offset + lightboxShots.length) % lightboxShots.length;
  return lightboxShots[index];
}

function placeTrack(transform) {
  lightboxTrack.style.transform = transform;
}

function paintSlides() {
  [-1, 0, 1].forEach((offset, position) => {
    const shot = shotAt(offset);
    const image = lightboxSlides[position];
    image.src = shot.dataset.full;
    image.alt = offset === 0 ? shot.querySelector("img").alt : "";
  });
  lightboxCount.textContent = `${lightboxIndex + 1} / ${lightboxShots.length}`;
  lightbox.classList.toggle("single", lightboxShots.length < 2);
}

function showLightbox(index) {
  lightboxIndex = (index + lightboxShots.length) % lightboxShots.length;
  lightbox.classList.add("instant");
  paintSlides();
  placeTrack(TRACK_CENTER);
  if (!lightbox.open) {
    lightboxScroll = window.scrollY;
    lightbox.showModal();
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => lightbox.classList.remove("instant"));
  });
}

function slideLightbox(direction) {
  lightbox.classList.remove("dragging");
  void lightboxTrack.offsetWidth;
  if (!direction) {
    placeTrack(TRACK_CENTER);
    return;
  }
  placeTrack(direction > 0 ? "translateX(-66.666%)" : "translateX(0)");
  const finish = (event) => {
    if (event && event.target !== lightboxTrack) return;
    lightboxTrack.removeEventListener("transitionend", finish);
    showLightbox(lightboxIndex + direction);
  };
  lightboxTrack.addEventListener("transitionend", finish);
}

lightbox.addEventListener("close", () => {
  placeTrack(TRACK_CENTER);
  window.scrollTo(0, lightboxScroll);
});

lightbox.addEventListener("pointerdown", (event) => {
  if (!lightbox.open || event.target.closest("button") || lightboxShots.length < 2) return;
  swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
  lightbox.setPointerCapture(event.pointerId);
});

lightbox.addEventListener("pointermove", (event) => {
  if (!swipe || event.pointerId !== swipe.id) return;
  const dx = event.clientX - swipe.x;
  const dy = event.clientY - swipe.y;
  if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
  lightbox.classList.add("dragging");
  placeTrack(`translateX(calc(-33.333% + ${dx}px))`);
});

function endSwipe(event, commit) {
  if (!swipe || event.pointerId !== swipe.id) return;
  const dx = event.clientX - swipe.x;
  swipe = null;
  if (commit && Math.abs(dx) > 10) ignoreLightboxClick = true;
  const direction = commit && dx <= -SWIPE_DISTANCE ? 1 : commit && dx >= SWIPE_DISTANCE ? -1 : 0;
  lightbox.classList.remove("dragging");

  if (!direction) {
    void lightboxTrack.offsetWidth;
    placeTrack(TRACK_CENTER);
    return;
  }

  const width = lightbox.querySelector(".lightbox-viewport").clientWidth;
  const parked = direction > 0 ? dx + width : dx - width;
  lightbox.classList.add("instant");
  lightboxIndex = (lightboxIndex + direction + lightboxShots.length) % lightboxShots.length;
  paintSlides();
  placeTrack(`translateX(calc(-33.333% + ${parked}px))`);
  void lightboxTrack.offsetWidth;
  requestAnimationFrame(() => {
    lightbox.classList.remove("instant");
    placeTrack(TRACK_CENTER);
  });
}

lightbox.addEventListener("pointerup", (event) => endSwipe(event, true));
lightbox.addEventListener("pointercancel", (event) => endSwipe(event, false));

let galleryDrag = null;
let ignoreGalleryClick = false;

document.addEventListener("pointerdown", (event) => {
  const gallery = event.target.closest(".gallery");
  if (!gallery || event.pointerType !== "mouse" || event.button !== 0) return;
  galleryDrag = { id: event.pointerId, x: event.clientX, scroll: gallery.scrollLeft, gallery, moved: false };
});

document.addEventListener("pointermove", (event) => {
  if (!galleryDrag || event.pointerId !== galleryDrag.id) return;
  const dx = event.clientX - galleryDrag.x;
  if (!galleryDrag.moved && Math.abs(dx) < 8) return;
  if (!galleryDrag.moved) galleryDrag.gallery.setPointerCapture(event.pointerId);
  galleryDrag.moved = true;
  galleryDrag.gallery.classList.add("dragging");
  galleryDrag.gallery.scrollLeft = galleryDrag.scroll - dx;
});

function endGalleryDrag(event) {
  if (!galleryDrag || event.pointerId !== galleryDrag.id) return;
  if (galleryDrag.moved) ignoreGalleryClick = true;
  galleryDrag.gallery.classList.remove("dragging");
  galleryDrag = null;
}

document.addEventListener("pointerup", endGalleryDrag);
document.addEventListener("pointercancel", endGalleryDrag);

document.addEventListener("input", (event) => {
  if (!event.target.matches(".search input")) return;
  filters.query = event.target.value.trim().toLowerCase();
  applyFilters({ animate: false });
});

document.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (chip) {
    filters[chip.dataset.filter] = chip.dataset.value;
    applyFilters();
    return;
  }
  const shot = event.target.closest(".shot");
  if (shot) {
    if (ignoreGalleryClick) {
      ignoreGalleryClick = false;
      return;
    }
    lightboxShots = [...shot.closest(".gallery").querySelectorAll(".shot")];
    showLightbox(lightboxShots.indexOf(shot));
    return;
  }
  if (!lightbox.open) return;
  if (ignoreLightboxClick) {
    ignoreLightboxClick = false;
    return;
  }
  if (event.target.closest(".lightbox-close") || event.target === lightbox) lightbox.close();
  if (event.target.closest(".lightbox-prev")) slideLightbox(-1);
  if (event.target.closest(".lightbox-next")) slideLightbox(1);
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.open || lightboxShots.length < 2) return;
  if (event.key === "ArrowLeft") slideLightbox(-1);
  if (event.key === "ArrowRight") slideLightbox(1);
});

window.addEventListener("hashchange", () => {
  if (lightbox.open) lightbox.close();
  route();
});
route();
