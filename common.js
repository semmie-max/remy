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
  // Edit this list to match the actual section ids on your page.
  // kind controls dash size: "title" > "subtitle" > "section" > "body"
  const PROX_SECTIONS = [
    { id: "hero", label: "Home", kind: "title" },
    { id: "tech-stack", label: "Tech", kind: "section" },
    { id: "projects", label: "Projects", kind: "subtitle" },
    { id: "testimonials", label: "Testimonials", kind: "subtitle" },
    { id: "footer", label: "Contact", kind: "section" },
  ].filter((s) => document.getElementById(s.id));

  if (!PROX_SECTIONS.length) return;

  const RADIUS = 40;
  const KIND_SIZE = {
    title: { base: 0.36, bump: 1 },
    subtitle: { base: 0.32, bump: 0.9 },
    section: { base: 0.27, bump: 0.8 },
    body: { base: 0.22, bump: 0.7 },
  };
  const ACTIVE_OFFSET = 0.4;
  const IDLE_RESET_DELAY = 400;

  const nav = document.createElement("nav");
  nav.id = "proximitySidebar";
  nav.setAttribute("aria-label", "Page sections");

  const list = document.createElement("div");
  list.className = "prox-dash-list";
  nav.appendChild(list);
  document.body.appendChild(nav);

  const dashes = PROX_SECTIONS.map((section) => {
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

  let mouseY = Infinity;
  let pointerInside = false;
  let idleTimer = null;

  function applyProximity() {
    dashes.forEach(({ section, btn, bar }) => {
      const rect = btn.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(mouseY - center);
      const size = KIND_SIZE[section.kind] || KIND_SIZE.body;

      let t;
      if (dist >= RADIUS) {
        t = 0;
      } else {
        t = 1 - dist / RADIUS;
      }

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

  function updateActive() {
    const anchorY = window.innerHeight * ACTIVE_OFFSET;
    let activeId = PROX_SECTIONS[0].id;
    let shortest = Infinity;

    PROX_SECTIONS.forEach((section) => {
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
      if (section.id === activeId) {
        btn.setAttribute("aria-current", "location");
      } else {
        btn.removeAttribute("aria-current");
      }
    });

    if (!pointerInside) pulseTo(activeId);
  }

  let scrollFrame = null;
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

  window.addEventListener("resize", updateActive);

  applyProximity();
  updateActive();
})();