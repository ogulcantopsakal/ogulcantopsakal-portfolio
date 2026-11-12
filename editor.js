const draft = structuredClone(SITE);
const status = document.querySelector("#status");
const removedSlugs = new Set();
const PAGE_SIZE = 6;
const editorView = { filter: "all", page: 0, openSlug: "" };
let imageState = {};

function slugify(value) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "project";
}

function uniqueSlug(title) {
  const base = slugify(title);
  let slug = base;
  let number = 2;
  while (draft.projects[slug]) {
    slug = `${base}-${number}`;
    number += 1;
  }
  return slug;
}

function sectionOf(slug) {
  return draft.sections.find((section) => section.projects.includes(slug));
}

function setStatus(message, kind) {
  status.textContent = message;
  status.classList.toggle("ok", kind === "ok");
  status.classList.toggle("bad", kind === "bad");
}

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function escapeText(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
}

function savedProjects() {
  return SITE.projects || {};
}

function fillSectionSelect() {
  const select = document.querySelector("#add-project select");
  select.innerHTML = draft.sections
    .map((section) => `<option value="${section.id}">${escapeText(section.title)}</option>`)
    .join("");
}

function cacheUrl(slug, name) {
  return `images/${slug}/${encodeURIComponent(name)}?v=${Date.now()}`;
}

async function loadImages() {
  const response = await fetch("/api/images");
  if (!response.ok) throw new Error("Image list failed");
  imageState = await response.json();
}

function projectRows() {
  const rows = [];
  for (const section of draft.sections) {
    for (const slug of section.projects) {
      const info = imageState[slug] || { cover: null, gallery: [] };
      rows.push({ slug, title: draft.projects[slug].title, section: section.title, sectionId: section.id, info });
    }
  }
  return rows;
}

function imageStatus(info) {
  const gallery = info.gallery || [];
  const cover = info.cover ? "cover ready" : "missing cover";
  const shots = gallery.length ? `${gallery.length} gallery` : "missing gallery";
  return `${cover} · ${shots}`;
}

function renderTodo() {
  const rows = projectRows();
  const missingCover = rows.filter((row) => !row.info.cover).length;
  const missingGallery = rows.filter((row) => !(row.info.gallery || []).length).length;
  const missing = rows.filter((row) => !row.info.cover || !(row.info.gallery || []).length);
  document.querySelector("#todo-summary").textContent =
    `${rows.length - missingCover} of ${rows.length} projects have a cover. ${rows.length - missingGallery} have gallery images.`;
  document.querySelector("#todo").innerHTML = missing.length
    ? `<ul class="missing">${missing
        .map(
          (row) => `
          <li>
            <button type="button" data-open="${escapeAttr(row.slug)}">${escapeText(row.title)}</button>
            <span class="meta">${escapeText(row.section)} · ${escapeText(imageStatus(row.info))}</span>
          </li>`
        )
        .join("")}</ul>`
    : `<p class="meta">Every project has a cover and gallery images.</p>`;
}

function visibleSlugs() {
  const sections = editorView.filter === "all"
    ? draft.sections
    : draft.sections.filter((section) => section.id === editorView.filter);
  return sections.flatMap((section) => section.projects);
}

function placeOpenProject() {
  if (!editorView.openSlug) return;
  const list = visibleSlugs();
  const index = list.indexOf(editorView.openSlug);
  if (index < 0) {
    editorView.openSlug = "";
    return;
  }
  editorView.page = Math.floor(index / PAGE_SIZE);
}

function renderJump() {
  const select = document.querySelector("#jump-project");
  const current = editorView.openSlug;
  select.innerHTML = `<option value="">Choose a project</option>${projectRows()
    .map(
      (row) =>
        `<option value="${escapeAttr(row.slug)}"${row.slug === current ? " selected" : ""}>${escapeText(row.title)}</option>`
    )
    .join("")}`;
}

function openProject(slug) {
  readForms();
  const section = sectionOf(slug);
  editorView.filter = section ? section.id : "all";
  editorView.openSlug = slug;
  placeOpenProject();
  renderProjects();
  const card = document.querySelector(`#project-${slug}`);
  if (card) card.scrollIntoView({ block: "start" });
}

function imageCard(row) {
  const { slug, title, section, info } = row;
  const saved = Boolean(savedProjects()[slug]);
  const gallery = info.gallery || [];
  const cover = info.cover
    ? `<figure class="thumb">
        <img src="${cacheUrl(slug, info.cover)}" alt="">
        <figcaption>Cover</figcaption>
        <button type="button" data-action="replace-cover">Replace cover</button>
      </figure>`
    : `<figure class="thumb missing"><figcaption>No cover</figcaption></figure>`;
  const thumbs = gallery
    .map((name, index) => `
      <figure class="thumb" draggable="true" data-file="${escapeAttr(name)}">
        <img src="${cacheUrl(slug, name)}" alt="">
        <div class="thumb-actions">
          <button type="button" data-action="make-cover">Cover</button>
          <button type="button" data-action="left" ${index === 0 ? "disabled" : ""}>Left</button>
          <button type="button" data-action="right" ${index === gallery.length - 1 ? "disabled" : ""}>Right</button>
          <button type="button" class="danger" data-action="delete-image">Delete</button>
        </div>
      </figure>`)
    .join("");
  const drop = saved
    ? `<div class="dropzone" data-drop>
        <p>Drop images here, or <button type="button" data-action="pick">choose files</button>. The first one becomes the cover if this project does not have one yet.</p>
        <input data-files type="file" accept="image/jpeg,image/png,image/webp" multiple hidden>
        <input data-cover type="file" accept="image/jpeg,image/png,image/webp" hidden>
      </div>`
    : `<p class="meta">Save this new project before adding images.</p>`;
  return `
    <article class="image-card" id="images-${slug}" data-slug="${slug}">
      ${drop}
      <div class="thumbs">${cover}${thumbs}</div>
      <p class="meta upload-note" data-note></p>
    </article>`;
}

function renderProjects() {
  readForms();
  placeOpenProject();
  const list = visibleSlugs();
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (editorView.page > pages - 1) editorView.page = pages - 1;
  if (editorView.page < 0) editorView.page = 0;
  const start = editorView.page * PAGE_SIZE;
  const pageSlugs = list.slice(start, start + PAGE_SIZE);

  document.querySelector("#filters").innerHTML = [
    ["all", "All"],
    ...draft.sections.map((section) => [section.id, section.title]),
  ]
    .map(
      ([id, title]) =>
        `<button type="button" data-filter="${escapeAttr(id)}" aria-pressed="${editorView.filter === id}">${escapeText(title)}</button>`
    )
    .join("");

  document.querySelector("#projects").innerHTML = pageSlugs.length
    ? pageSlugs.map((slug) => projectEditor(slug)).join("")
    : `<p class="meta">No projects in this section.</p>`;

  const pager = document.querySelector("#pager");
  pager.hidden = list.length <= PAGE_SIZE;
  pager.innerHTML = `
    <button type="button" data-page="prev" ${editorView.page === 0 ? "disabled" : ""}>Previous</button>
    <span class="meta">${list.length ? start + 1 : 0}–${Math.min(start + PAGE_SIZE, list.length)} of ${list.length}</span>
    <button type="button" data-page="next" ${editorView.page >= pages - 1 ? "disabled" : ""}>Next</button>`;
  renderJump();
}

function projectEditor(slug) {
  const project = draft.projects[slug];
  const section = sectionOf(slug);
  const index = section.projects.indexOf(slug);
  const open = editorView.openSlug === slug;
  const info = imageState[slug] || { cover: null, gallery: [] };
  const options = draft.sections
    .map(
      (item) =>
        `<option value="${item.id}"${item.id === section.id ? " selected" : ""}>${escapeText(item.title)}</option>`
    )
    .join("");
  const body = open
    ? `<div class="project-body">
        <div class="project-edit">
          <label>Title <input data-field="title" value="${escapeAttr(project.title)}" /></label>
          <label class="description">Description <textarea data-field="summary">${escapeText(project.summary || "")}</textarea></label>
          <label>Role <input data-field="role" value="${escapeAttr(project.role || "")}" placeholder="Gameplay" /></label>
          <label>Year <input data-field="year" value="${escapeAttr(project.year || "")}" maxlength="9" placeholder="2024" /></label>
          <label class="grow">Link <input data-field="link" value="${escapeAttr(project.link || "")}" placeholder="https://" /></label>
          <label>Section <select data-field="section">${options}</select></label>
          <button type="button" data-action="up" ${index === 0 ? "disabled" : ""}>Up</button>
          <button type="button" data-action="down" ${index === section.projects.length - 1 ? "disabled" : ""}>Down</button>
          <a href="index.html#/${slug}">View page</a>
          <button type="button" class="danger" data-action="delete">Remove</button>
        </div>
        ${imageCard({ slug, title: project.title, section: section.title, info })}
      </div>`
    : "";
  return `
    <article class="project${open ? " open" : ""}" id="project-${slug}" data-slug="${slug}">
      <button type="button" class="project-toggle" data-action="toggle" aria-expanded="${open}">
        <span><strong>${escapeText(project.title)}</strong><span class="meta">${escapeText(section.title)} · ${escapeText(imageStatus(info))}</span></span>
        <span>${open ? "Hide" : "Edit"}</span>
      </button>
      ${body}
    </article>`;
}

function renderWelcome() {
  const form = document.querySelector("#welcome");
  form.innerHTML = `
    <label>Heading <input name="title" value="${escapeAttr(draft.welcome.title)}" /></label>
    ${draft.welcome.blocks
      .map(
        (block, index) => `
        <label>Block title <input data-block="${index}" data-part="label" value="${escapeAttr(block.label)}" /></label>
        <label>Text <textarea data-block="${index}" data-part="body">${escapeText(block.paragraphs.join("\n\n"))}</textarea></label>`
      )
      .join("")}`;
}

function renderLinks() {
  document.querySelector("#links").innerHTML = `
    <label>LinkedIn <input name="linkedin" value="${escapeAttr(draft.links.linkedin)}" /></label>
    <label>GitHub <input name="github" value="${escapeAttr(draft.links.github)}" /></label>
    <label>Email <input name="email" value="${escapeAttr(draft.links.email)}" /></label>
    <label>Site name <input name="name" value="${escapeAttr(draft.name)}" /></label>
    <label>Tagline <input name="tagline" value="${escapeAttr(draft.tagline)}" /></label>`;
}

function readForms() {
  const welcome = document.querySelector("#welcome");
  draft.welcome.title = welcome.querySelector('[name="title"]').value.trim() || "WELCOME";
  draft.welcome.blocks.forEach((block, index) => {
    block.label = welcome.querySelector(`[data-block="${index}"][data-part="label"]`).value.trim();
    block.paragraphs = welcome
      .querySelector(`[data-block="${index}"][data-part="body"]`)
      .value.split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter(Boolean);
  });

  const links = document.querySelector("#links");
  draft.links.linkedin = links.linkedin.value.trim();
  draft.links.github = links.github.value.trim();
  draft.links.email = links.email.value.trim();
  draft.name = links.name.value.trim() || draft.name;
  draft.tagline = links.tagline.value.trim();

  document.querySelectorAll(".project").forEach((card) => {
    const slug = card.dataset.slug;
    const project = draft.projects[slug];
    const title = card.querySelector('[data-field="title"]');
    if (!project || !title) return;
    project.title = title.value.trim() || project.title;
    project.summary = card.querySelector('[data-field="summary"]').value.trim();
    project.role = card.querySelector('[data-field="role"]').value.trim();
    project.year = card.querySelector('[data-field="year"]').value.trim();
    project.link = card.querySelector('[data-field="link"]').value.trim();
    const nextSection = card.querySelector('[data-field="section"]').value;
    const current = sectionOf(slug);
    if (current && current.id !== nextSection) {
      current.projects = current.projects.filter((item) => item !== slug);
      draft.sections.find((section) => section.id === nextSection).projects.push(slug);
    }
  });
}

function sitePayload() {
  const projects = {};
  for (const [slug, project] of Object.entries(draft.projects)) {
    const clean = { title: project.title };
    for (const key of ["summary", "role", "year", "link"]) {
      if (project[key]) clean[key] = project[key];
    }
    projects[slug] = clean;
  }
  return { ...draft, projects };
}

function cardNote(slug, message) {
  const note = document.querySelector(`[data-slug="${slug}"] .upload-note`);
  if (note) note.textContent = message;
}

function postForm(url, body, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      let payload = {};
      try {
        payload = JSON.parse(xhr.responseText || "{}");
      } catch {
        payload = {};
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(payload);
      else reject(new Error(payload.error || "Upload failed"));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(body);
  });
}

async function uploadFiles(slug, files, target) {
  const body = new FormData();
  body.append("target", target);
  for (const file of files) body.append("files", file);
  cardNote(slug, "Uploading 0%");
  const record = await postForm(`/api/images/${slug}`, body, (percent) => {
    cardNote(slug, `Uploading ${percent}%`);
  });
  imageState[slug] = record;
  renderProjects();
  renderTodo();
  setStatus("Images updated.");
}

async function mutate(slug, url, options) {
  const response = await fetch(url, options);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Image update failed");
  imageState[slug] = payload;
  renderProjects();
  renderTodo();
}

document.querySelector("#add-project").addEventListener("submit", (event) => {
  event.preventDefault();
  readForms();
  const form = event.currentTarget;
  const title = form.title.value.trim();
  const slug = uniqueSlug(title);
  removedSlugs.delete(slug);
  draft.projects[slug] = { title, summary: form.summary.value.trim() };
  draft.sections.find((section) => section.id === form.section.value).projects.push(slug);
  const sectionId = form.section.value;
  form.reset();
  fillSectionSelect();
  editorView.filter = sectionId || "all";
  editorView.openSlug = slug;
  document.querySelector("#add details").open = false;
  renderProjects();
  renderTodo();
  document.querySelector(`#project-${slug}`)?.scrollIntoView({ block: "start" });
  setStatus(`Added ${title}. Save before uploading images.`);
});

document.querySelector("#jump-project").addEventListener("change", (event) => {
  if (event.target.value) openProject(event.target.value);
});

document.querySelector("#filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  editorView.filter = button.dataset.filter;
  editorView.page = 0;
  editorView.openSlug = "";
  renderProjects();
});

document.querySelector("#pager").addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button || button.disabled) return;
  editorView.page += button.dataset.page === "next" ? 1 : -1;
  editorView.openSlug = "";
  renderProjects();
  document.querySelector("#project-section").scrollIntoView({ block: "start" });
});

document.querySelector("#todo").addEventListener("click", (event) => {
  const button = event.target.closest("[data-open]");
  if (!button) return;
  openProject(button.dataset.open);
});

document.querySelector("#projects").addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "toggle") {
    const slug = button.closest(".project").dataset.slug;
    editorView.openSlug = editorView.openSlug === slug ? "" : slug;
    renderProjects();
    if (editorView.openSlug) document.querySelector(`#project-${slug}`)?.scrollIntoView({ block: "start" });
    return;
  }
  if (action === "delete" || action === "up" || action === "down") {
    readForms();
    const card = button.closest(".project");
    const slug = card.dataset.slug;
    const section = sectionOf(slug);
    const index = section.projects.indexOf(slug);
    if (action === "delete") {
      if (!confirm(`Remove ${draft.projects[slug].title}?`)) return;
      section.projects.splice(index, 1);
      delete draft.projects[slug];
      if (savedProjects()[slug]) removedSlugs.add(slug);
      editorView.openSlug = "";
    } else if (action === "up" && index > 0) {
      [section.projects[index - 1], section.projects[index]] = [section.projects[index], section.projects[index - 1]];
    } else if (action === "down" && index < section.projects.length - 1) {
      [section.projects[index + 1], section.projects[index]] = [section.projects[index], section.projects[index + 1]];
    }
    renderProjects();
    renderTodo();
    return;
  }

  const card = button.closest(".image-card");
  if (!card) return;
  const slug = card.dataset.slug;
  const file = button.closest("[data-file]")?.dataset.file;
  try {
    if (button.dataset.action === "pick") {
      card.querySelector("[data-files]").click();
    } else if (button.dataset.action === "replace-cover") {
      card.querySelector("[data-cover]").click();
    } else if (button.dataset.action === "delete-image") {
      await mutate(slug, `/api/images/${slug}/${encodeURIComponent(file)}`, { method: "DELETE" });
    } else if (button.dataset.action === "make-cover") {
      await mutate(slug, `/api/images/${slug}/cover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file }),
      });
    } else if (button.dataset.action === "left" || button.dataset.action === "right") {
      const order = [...(imageState[slug].gallery || [])];
      const index = order.indexOf(file);
      const swap = button.dataset.action === "left" ? index - 1 : index + 1;
      [order[index], order[swap]] = [order[swap], order[index]];
      await mutate(slug, `/api/images/${slug}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
    }
  } catch (error) {
    cardNote(slug, error.message);
  }
});

document.querySelector("#projects").addEventListener("change", async (event) => {
  const input = event.target;
  const card = input.closest(".image-card");
  if (!card || !input.files?.length) return;
  const slug = card.dataset.slug;
  try {
    await uploadFiles(slug, [...input.files], input.hasAttribute("data-cover") ? "cover" : "gallery");
  } catch (error) {
    cardNote(slug, error.message);
  }
  input.value = "";
});

let draggedFile = "";
let draggedSlug = "";

document.querySelector("#projects").addEventListener("dragstart", (event) => {
  const thumb = event.target.closest("[data-file]");
  if (!thumb) return;
  draggedFile = thumb.dataset.file;
  draggedSlug = thumb.closest(".image-card").dataset.slug;
  event.dataTransfer.effectAllowed = "move";
});

document.querySelector("#projects").addEventListener("dragover", (event) => {
  const zone = event.target.closest("[data-drop]");
  const thumb = event.target.closest("[data-file]");
  if (!zone && !thumb) return;
  event.preventDefault();
  if (zone) zone.classList.add("dragover");
});

document.querySelector("#projects").addEventListener("dragleave", (event) => {
  const zone = event.target.closest("[data-drop]");
  if (zone) zone.classList.remove("dragover");
});

document.querySelector("#projects").addEventListener("drop", async (event) => {
  const thumb = event.target.closest("[data-file]");
  const card = event.target.closest(".image-card");
  if (thumb && card && draggedFile && card.dataset.slug === draggedSlug && thumb.dataset.file !== draggedFile) {
    event.preventDefault();
    const order = [...(imageState[draggedSlug].gallery || [])];
    const from = order.indexOf(draggedFile);
    const to = order.indexOf(thumb.dataset.file);
    if (from >= 0 && to >= 0) {
      order.splice(from, 1);
      order.splice(to, 0, draggedFile);
      try {
        await mutate(draggedSlug, `/api/images/${draggedSlug}/order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order }),
        });
      } catch (error) {
        cardNote(draggedSlug, error.message);
      }
    }
    draggedFile = "";
    return;
  }
  const zone = event.target.closest("[data-drop]");
  if (!zone) return;
  event.preventDefault();
  zone.classList.remove("dragover");
  if (draggedFile) {
    draggedFile = "";
    return;
  }
  const files = [...event.dataTransfer.files];
  if (!files.length) return;
  try {
    await uploadFiles(card.dataset.slug, files, "gallery");
  } catch (error) {
    cardNote(card.dataset.slug, error.message);
  }
});

const saveButton = document.querySelector("#save");
let saveTimer = 0;

document.querySelector("#save").addEventListener("click", async () => {
  readForms();
  window.clearTimeout(saveTimer);
  saveButton.disabled = true;
  saveButton.classList.remove("is-saved");
  saveButton.textContent = "Saving…";
  setStatus("Saving…");
  try {
    const response = await fetch("/api/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sitePayload()),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Save failed");
    for (const slug of removedSlugs) {
      if (draft.projects[slug]) continue;
      const removed = await fetch(`/api/images/${slug}`, { method: "DELETE" });
      if (!removed.ok) {
        const body = await removed.json();
        throw new Error(body.error || "Could not delete images");
      }
    }
    removedSlugs.clear();
    const saved = sitePayload();
    SITE.name = saved.name;
    SITE.tagline = saved.tagline;
    SITE.links = saved.links;
    SITE.welcome = saved.welcome;
    SITE.sections = saved.sections;
    SITE.projects = saved.projects;
    await loadImages();
    renderProjects();
    renderTodo();
    saveButton.disabled = false;
    saveButton.textContent = "Saved";
    saveButton.classList.add("is-saved");
    setStatus("Saved", "ok");
    saveTimer = window.setTimeout(() => {
      saveButton.textContent = "Save";
      saveButton.classList.remove("is-saved");
    }, 1600);
  } catch (error) {
    saveButton.textContent = "Save";
    saveButton.disabled = false;
    setStatus(error.message, "bad");
  }
});

fillSectionSelect();
renderWelcome();
renderLinks();
renderProjects();
loadImages()
  .then(() => {
    renderProjects();
    renderTodo();
  })
  .catch(() => {
    renderTodo();
    setStatus("Image tools need the local server. Start it with: python3 serve.py");
  });
