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
  const TICKS = 10;

  const wrap = document.createElement('div');
  wrap.id = 'scrollProgress';
  wrap.innerHTML = `
    <div class="sp-track">
      <div class="sp-ticks"></div>
      <div class="sp-fill"></div>
      <div class="sp-head">
        <span class="sp-ripple"></span>
        <svg class="sp-pin" viewBox="0 0 24 32" aria-hidden="true">
          <path fill-rule="evenodd" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0zm0 17a5 5 0 0 1 0-10 5 5 0 0 1 0 10z"/>
        </svg>
        <span class="sp-label">0</span>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  const fill = wrap.querySelector('.sp-fill');
  const head = wrap.querySelector('.sp-head');
  const label = wrap.querySelector('.sp-label');
  const ticksWrap = wrap.querySelector('.sp-ticks');

  const ticks = [];
  for (let i = 0; i <= TICKS; i++) {
    const tick = document.createElement('span');
    tick.className = 'sp-tick';
    tick.style.top = (i / TICKS) * 100 + '%';
    ticksWrap.appendChild(tick);
    ticks.push(tick);
  }

  let target = 0;
  let current = 0;
  let running = false;

  function readTarget() {
    const doc = document.documentElement;
    const total = Math.max(doc.scrollHeight, document.body.scrollHeight);
    const max = total - window.innerHeight;
    target = max > 0 ? (window.scrollY / max) * 100 : 0;
    target = Math.min(100, Math.max(0, target));
    start();
  }

  function render() {
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.05) current = target;

    fill.style.height = current + '%';
    head.style.top = current + '%';
    label.textContent = Math.round(current);

    ticks.forEach((tick, i) => {
      tick.classList.toggle('passed', (i / TICKS) * 100 <= current + 0.5);
    });

    if (current !== target) {
      requestAnimationFrame(render);
    } else {
      running = false;
    }
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(render);
  }

  window.addEventListener('scroll', readTarget, { passive: true });
  window.addEventListener('resize', readTarget);
  window.addEventListener('load', readTarget);
  readTarget();
})();