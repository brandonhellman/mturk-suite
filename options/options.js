document.getElementById(`hitTracker`).addEventListener(`change`, (event) => {
  document.getElementById(`hit-tracker`).hidden = !event.target.checked;
});

document.getElementById(`hitExporter`).addEventListener(`change`, (event) => {
  document.getElementById(`hit-exporter`).hidden = !event.target.checked;
});

document.getElementById(`turkerview`).addEventListener(`change`, (event) => {
  document.getElementById(`turkerview-advanced`).hidden = !event.target.checked;
});

document.getElementById(`blockListOnMturk`).addEventListener(`change`, (event) => {
  document.getElementById(`blockLocation`).disabled = !event.target.checked;
  document.getElementById(`blockMaster`).disabled = !event.target.checked;
});

chrome.storage.local.get(`options`, (keys) => {
  const { options } = keys;

  [...document.querySelectorAll(`input[type="checkbox"]`)].forEach((el) => {
    // eslint-disable-next-line no-param-reassign
    el.checked = options[el.id];

    el.addEventListener(`change`, (event) => {
      options[event.target.id] = event.target.checked;
      chrome.storage.local.set({ options });
    });
  });

  [...document.querySelectorAll(`input[name="export"]`)].forEach((el) => {
    // eslint-disable-next-line no-param-reassign
    el.checked = options[el.id];

    el.addEventListener(`change`, (event) => {
      options.hitExporterType = event.target.id;
      chrome.storage.local.set({ options });
    });
  });

  [...document.querySelectorAll(`select`)].forEach((el) => {
    // eslint-disable-next-line no-param-reassign
    el.value = options[el.id];

    el.addEventListener(`change`, (event) => {
      options[event.target.id] = event.target.value;
      chrome.storage.local.set({ options });
    });
  });

  document.querySelector(`input[name="turkerviewApiKey"]`).value = options.turkerviewApiKey;

  document.querySelector(`input[name="turkerviewApiKey"]`).addEventListener(`input`, (event) => {
    options.turkerviewApiKey = event.target.value;
    chrome.storage.local.set({ options });
    document.getElementById(`turkerviewConnected`).hidden = event.target.value.length === 40 ? `` : `none`;
  });

  document.getElementById(`hit-exporter`).hidden = !options.hitExporter;
  document.getElementById(`hit-tracker`).hidden = !options.hitTracker;
  document.getElementById(`turkerview-advanced`).hidden = !options.turkerview;
  document.getElementById(`turkerviewConnected`).hidden = options.turkerviewApiKey.length !== 40;
});
