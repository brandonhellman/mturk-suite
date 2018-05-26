function setTheme(style) {
  const el = document.getElementById(`mts-theme`);
  const href = chrome.extension.getURL(`bootstrap/css/${style}.worker.css`);

  if (el) {
    el.href = href;
  } else {
    document.head.insertAdjacentHTML(
      `beforeend`,
      HTML`<link rel="stylesheet" type="text/css" href="${href}" id="mts-theme">`
    );
  }
}

async function theme() {
  const { themeMturk } = await StorageGetKey(`options`);
  if (themeMturk !== `default`) setTheme(themeMturk);

  chrome.storage.onChanged.addListener(changes => {
    if (changes.options && changes.options.newValue.themeMturk) {
      setTheme(changes.options.newValue.themeMturk);
    }
  });
}

theme();
