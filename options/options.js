document.getElementById(`hitTracker`).addEventListener(`change`, event => {
  document.getElementById(`hit-tracker`).hidden = !event.target.checked;
});

document.getElementById(`hitExporter`).addEventListener(`change`, event => {
  document.getElementById(`hit-exporter`).hidden = !event.target.checked;
});

document
  .getElementById(`requesterReviews`)
  .addEventListener(`change`, event => {
    document.getElementById(`requester-reviews`).hidden = !event.target.checked;
  });

chrome.storage.local.get(`options`, keys => {
  const { options } = keys;

  [...document.querySelectorAll(`input[type="checkbox"]`)].forEach(el => {
    if (options[el.id]) el.click();

    el.addEventListener(`change`, event => {
      options[event.target.id] = event.target.checked;
      chrome.storage.local.set({ options });
    });
  });

  [...document.querySelectorAll(`input[name="export"]`)].forEach(el => {
    if (options.hitExporterType === el.id) el.click();

    el.addEventListener(`change`, event => {
      options.hitExporterType = event.target.id;
      chrome.storage.local.set({ options });
    });
  });

  [...document.querySelectorAll(`select`)].forEach(el => {
    // eslint-disable-next-line no-param-reassign
    el.value = options[el.id];
    el.addEventListener(`change`, event => {
      options[event.target.id] = event.target.value;
      chrome.storage.local.set({ options });
    });
  });
});
