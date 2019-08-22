async function hitDetailsSticky() {
  await Enabled(`hitDetailsSticky`);

  const detailBar = document.getElementsByClassName(`project-detail-bar`)[0];
  const detailBarTop = detailBar.offsetTop;

  window.addEventListener(`scroll`, () => {
    if (window.scrollY > detailBarTop) {
      document.body.style.marginTop = `${detailBar.offsetHeight}px`;
      detailBar.classList.toggle(`sticky`, true);
    } else {
      document.body.style.marginTop = `0px`;
      detailBar.classList.toggle(`sticky`, false);
    }

    detailBar.style.backgroundColor = window.getComputedStyle(
      document.body,
      null
    ).backgroundColor;
  });

  const style = document.createElement(`style`);
  style.innerHTML = `.project-detail-bar.sticky { position: fixed; top: 0; z-index: 10000; width: 100%;}`;
  document.head.appendChild(style);
}

hitDetailsSticky();
