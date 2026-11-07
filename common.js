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
  const progress = document.createElement('div');
  progress.id = 'scrollProgress';
  document.body.appendChild(progress);

  let frame = null;

  function update() {
    frame = null;
    const doc = document.documentElement;
    const total = Math.max(doc.scrollHeight, document.body.scrollHeight);
    const max = total - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.height = Math.min(100, Math.max(0, pct)) + '%';
  }

  function onScroll() {
    if (frame) return;
    frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();