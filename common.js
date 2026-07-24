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




// Create the scrollbar automatically
const indicator = document.createElement("div");
indicator.id = "scrollIndicator";
document.body.appendChild(indicator);

let hideTimer;

function updateScrollIndicator() {

    const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

    if (maxScroll <= 0) return;

    const progress = window.scrollY / maxScroll;

    const travel =
        window.innerHeight - indicator.offsetHeight - 20;

    indicator.style.transform =
        `translateY(${progress * travel}px)`;
}

window.addEventListener("scroll", () => {

    updateScrollIndicator();

    indicator.style.opacity = "1";

    clearTimeout(hideTimer);

    hideTimer = setTimeout(() => {

        indicator.style.opacity = "0";

    }, 1000);

});

updateScrollIndicator();