const EXTS = ["jpg", "jpeg", "png", "webp"];

const ICONS = {
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.7 3.3A2.2 2.2 0 1 0 4.7 7.7 2.2 2.2 0 0 0 4.7 3.3zM3 9h3.4v12H3zM10 9h3.3v1.7h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5V21H17.7v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H10z"/></svg>',
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.4 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z"/></svg>',
  email:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5v-11zm2.2.3 7.2 5.2c.4.3.9.3 1.2 0l7.2-5.2a.9.9 0 0 0-.3-.8h-15a.9.9 0 0 0-.3.8z"/></svg>',
};

function probe(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function firstExisting(paths) {
  for (const path of paths) {
    const found = await probe(path);
    if (found) return found;
  }
  return null;
}

function coverCandidates(slug) {
  const paths = [];
  for (const ext of EXTS) paths.push(`images/${slug}/cover.${ext}`);
  for (const ext of EXTS) paths.push(`images/${slug}/01.${ext}`);
  return paths;
}

async function galleryPaths(slug) {
  const images = [];
  for (let index = 1; index <= 48; index += 1) {
    const name = String(index).padStart(2, "0");
    const found = await firstExisting(
      EXTS.map((ext) => `images/${slug}/${name}.${ext}`)
    );
    if (!found) break;
    images.push(found);
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

  const social = document.querySelector("#social");
  social.innerHTML = `
    <a href="${SITE.links.linkedin}" aria-label="LinkedIn">${ICONS.linkedin}</a>
    <a href="${SITE.links.github}" aria-label="GitHub">${ICONS.github}</a>
    <a href="mailto:${SITE.links.email}" aria-label="Email">${ICONS.email}</a>
  `;
}

function renderHome() {
  document.title = SITE.name;
  renderChrome("");
  const blocks = SITE.welcome.blocks
    .map(
      (block) => `
      <section class="block">
        <h2>${escapeHtml(block.label)}</h2>
        <div>${block.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
      </section>`
    )
    .join("");

  document.querySelector("#main").innerHTML = `
    <h1 class="welcome-title">${escapeHtml(SITE.welcome.title)}</h1>
    <div class="blocks">${blocks}</div>
    <a class="back" href="#/">↑ Back to Top</a>
  `;
}

function studioName(role) {
  if (!role || role.startsWith("Mobile")) return "";
  return role.split(" · ")[0];
}

function renderSection(section) {
  document.title = `${section.title} — ${SITE.name}`;
  renderChrome(section.id);
  const cards = section.projects
    .map((slug) => {
      const project = SITE.projects[slug];
      return `
        <a class="card" href="#/${slug}" data-slug="${slug}">
          <div class="frame placeholder" data-frame="${slug}"><span>No image yet</span></div>
          <h2>${escapeHtml(project.title)}</h2>
          ${studioName(project.role) ? `<p class="studio">${escapeHtml(studioName(project.role))}</p>` : ""}
          ${project.year ? `<p class="year">${escapeHtml(project.year)}</p>` : ""}
        </a>`;
    })
    .join("");

  const empty = section.projects.length
    ? ""
    : `<p class="empty-note">No pages in this section yet. Add them in the editor.</p>`;

  document.querySelector("#main").innerHTML = `
    <h1 class="page-title">${escapeHtml(section.title).toUpperCase()}</h1>
    <div class="cards">${cards}</div>
    ${empty}
    <a class="back" href="#/">↑ Back to Top</a>
  `;

  for (const slug of section.projects) {
    firstExisting(coverCandidates(slug)).then((src) => {
      if (!src) return;
      const frame = document.querySelector(`[data-frame="${slug}"]`);
      if (!frame) return;
      frame.classList.remove("placeholder");
      frame.innerHTML = `<img src="${src}" alt="${escapeHtml(SITE.projects[slug].title)}" loading="lazy" decoding="async">`;
    });
  }
}

async function renderProject(slug) {
  const project = SITE.projects[slug];
  const section = sectionFor(slug);
  document.title = `${project.title} — ${SITE.name}`;
  renderChrome(section ? section.id : "");
  document.querySelector("#main").innerHTML = `
    <h1 class="page-title">${escapeHtml(project.title).toUpperCase()}</h1>
    <div class="blocks project-copy">
      <section class="block"><h2>Description</h2><div><p>Loading images…</p></div></section>
    </div>
  `;

  const images = await galleryPaths(slug);
  const gallery = images.length
    ? `<div class="gallery">${images
        .map(
          (src) =>
            `<button type="button" class="shot" data-full="${escapeHtml(src)}"><img src="${escapeHtml(src)}" alt="${escapeHtml(project.title)}" loading="lazy" decoding="async"></button>`
        )
        .join("")}</div>`
    : `<p class="empty-note">Add the pictures for this page to <code>images/${slug}/</code>. Use <code>cover.jpg</code> for the card and <code>01.jpg</code>, <code>02.jpg</code>, and so on for the page. png and webp work too.</p>`;

  const back = section
    ? `<a class="back" href="#/${section.id}">← ${escapeHtml(section.title)}</a>`
    : `<a class="back" href="#/">← Home</a>`;

  document.querySelector("#main").innerHTML = `
    <h1 class="page-title">${escapeHtml(project.title).toUpperCase()}</h1>
    <div class="blocks project-copy">${projectBlocks(project, gallery)}</div>
    ${back}
  `;
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
const lightboxImage = lightbox.querySelector("img");
let lightboxShots = [];
let lightboxIndex = 0;

let lightboxScroll = 0;

function showLightbox(index) {
  lightboxIndex = (index + lightboxShots.length) % lightboxShots.length;
  const shot = lightboxShots[lightboxIndex];
  lightboxImage.src = shot.dataset.full;
  lightboxImage.alt = shot.querySelector("img").alt;
  if (!lightbox.open) {
    lightboxScroll = window.scrollY;
    lightbox.showModal();
  }
}

lightbox.addEventListener("close", () => {
  window.scrollTo(0, lightboxScroll);
});

document.addEventListener("click", (event) => {
  const shot = event.target.closest(".shot");
  if (shot) {
    lightboxShots = [...shot.closest(".gallery").querySelectorAll(".shot")];
    showLightbox(lightboxShots.indexOf(shot));
    return;
  }
  if (!lightbox.open) return;
  if (event.target.closest(".lightbox-close") || event.target === lightbox) lightbox.close();
  if (event.target.closest(".lightbox-prev")) showLightbox(lightboxIndex - 1);
  if (event.target.closest(".lightbox-next")) showLightbox(lightboxIndex + 1);
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.open || lightboxShots.length < 2) return;
  if (event.key === "ArrowLeft") showLightbox(lightboxIndex - 1);
  if (event.key === "ArrowRight") showLightbox(lightboxIndex + 1);
});

window.addEventListener("hashchange", () => {
  if (lightbox.open) lightbox.close();
  route();
});
route();
