(function(){
  const loader = document.createElement('div');
  loader.id = 'tixteeLoader';
  loader.innerHTML = `
    <div class="loader">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </div>
  `;
  document.body.insertBefore(loader, document.body.firstChild);

  const minTime = new Promise(resolve => setTimeout(resolve, 900));
  const pageLoaded = new Promise(resolve => {
    if(document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve);
  });

  Promise.all([minTime, pageLoaded]).then(() => {
    loader.classList.add('hide');
    setTimeout(() => loader.remove(), 500);
  });
})();



(function () {
  const RADIUS = 40;
  const KIND_SIZE = {
    title: { base: 0.36, bump: 1 },
    subtitle: { base: 0.32, bump: 0.9 },
    section: { base: 0.27, bump: 0.8 },
    body: { base: 0.22, bump: 0.7 },
  };
  const ACTIVE_OFFSET = 0.4;
  const IDLE_RESET_DELAY = 400;

  let nav, list;
  let dashes = [];
  let sections = [];
  let mouseY = Infinity;
  let pointerInside = false;
  let idleTimer = null;
  let scrollFrame = null;
  let rebuildTimer = null;

  function detectKind(el) {
    const explicit = el.getAttribute("data-proxy-kind");
    if (explicit && KIND_SIZE[explicit]) return explicit;

    const heading = el.querySelector("h1, h2, h3, h4, h5, h6");
    const tag = heading?.tagName.toLowerCase();
    if (tag === "h1") return "title";
    if (tag === "h2") return "subtitle";
    if (tag === "h3") return "section";
    return "body";
  }

  function detectLabel(el) {
    const explicit = el.getAttribute("data-proxy-label");
    if (explicit) return explicit;

    const heading = el.querySelector("h1, h2, h3, h4, h5, h6");
    if (heading?.textContent?.trim()) return heading.textContent.trim();

    return (el.id || "section").replace(/[-_]+/g, " ").trim();
  }

  function collectSections() {
    const found = Array.from(document.querySelectorAll("[data-proxy-section]"))
      .filter((el) => el.id)
      .map((el) => ({
        id: el.id,
        label: detectLabel(el),
        kind: detectKind(el),
        el,
      }));

    found.sort((a, b) => {
      const pos = a.el.compareDocumentPosition(b.el);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    return found;
  }

  function buildNav() {
    if (!nav) {
      nav = document.createElement("nav");
      nav.id = "proximitySidebar";
      nav.setAttribute("aria-label", "Page sections");

      list = document.createElement("div");
      list.className = "prox-dash-list";
      nav.appendChild(list);
      document.body.appendChild(nav);

      list.addEventListener("pointermove", (e) => {
        pointerInside = true;
        clearTimeout(idleTimer);
        mouseY = e.clientY;
        applyProximity();
      });

      list.addEventListener("pointerleave", () => {
        pointerInside = false;
        mouseY = Infinity;
        applyProximity();
      });
    }

    list.innerHTML = "";
    dashes = sections.map((section) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "prox-dash-btn";
      btn.dataset.id = section.id;
      btn.dataset.kind = section.kind;
      btn.setAttribute("aria-label", `Go to ${section.label}`);
      btn.title = section.label;

      const bar = document.createElement("span");
      bar.className = "prox-dash-bar";
      btn.appendChild(bar);

      btn.addEventListener("click", () => {
        const target = document.getElementById(section.id);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${section.id}`);
      });

      list.appendChild(btn);
      return { section, btn, bar };
    });

    nav.classList.toggle("prox-empty", dashes.length === 0);
  }

  function applyProximity() {
    dashes.forEach(({ section, btn, bar }) => {
      const rect = btn.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(mouseY - center);
      const size = KIND_SIZE[section.kind] || KIND_SIZE.body;

      const t = dist >= RADIUS ? 0 : 1 - dist / RADIUS;
      const scale = size.base + (size.bump - size.base) * t;
      bar.style.setProperty("--prox-scale", scale.toFixed(3));
    });
  }

  function pulseTo(id) {
    const target = dashes.find((d) => d.section.id === id);
    if (!target) return;
    const rect = target.btn.getBoundingClientRect();
    mouseY = rect.top + rect.height / 2;
    applyProximity();

    if (pointerInside) return;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      mouseY = Infinity;
      applyProximity();
    }, IDLE_RESET_DELAY);
  }

  function updateActive() {
    if (!sections.length) return;

    const anchorY = window.innerHeight * ACTIVE_OFFSET;
    let activeId = sections[0].id;
    let shortest = Infinity;

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const contains = rect.top <= anchorY && rect.bottom >= anchorY;
      const dist = contains
        ? 0
        : Math.min(Math.abs(rect.top - anchorY), Math.abs(rect.bottom - anchorY));
      if (dist < shortest) {
        shortest = dist;
        activeId = section.id;
      }
    });

    dashes.forEach(({ section, btn }) => {
      if (section.id === activeId) btn.setAttribute("aria-current", "location");
      else btn.removeAttribute("aria-current");
    });

    if (!pointerInside) pulseTo(activeId);
  }

  function rebuild() {
    const next = collectSections();
    const changed =
      next.length !== sections.length ||
      next.some((s, i) => s.id !== sections[i]?.id);

    sections = next;

    if (changed) buildNav();
    applyProximity();
    updateActive();
  }

  function scheduleRebuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(rebuild, 150);
  }

  window.addEventListener(
    "scroll",
    () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = null;
        updateActive();
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", scheduleRebuild);
  window.addEventListener("orientationchange", scheduleRebuild);

  const observer = new MutationObserver(scheduleRebuild);
  observer.observe(document.body, { childList: true, subtree: true });

  function init() {
    sections = collectSections();
    buildNav();
    applyProximity();
    updateActive();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();