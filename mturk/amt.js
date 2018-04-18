// Lets all extension pages know we are logged in.
chrome.runtime.sendMessage({ loggedIn: true });

// Sets the theme on MTurk.
chrome.storage.local.get([`themes`], keys => {
  if (keys.themes.mturk !== `default`) {
    const el = document.getElementById(`mturk-theme`);
    const href = chrome.extension.getURL(`bootstrap/css/${keys.themes.mturk}.worker.css`);

    if (el) {
      el.href = href;
    } else {
      const theme = document.createElement(`link`);
      theme.id = `mturk-theme`;
      theme.rel = "stylesheet";
      theme.href = href;
      theme.type = `text/css`;
      (document.head || document.documentElement).appendChild(theme);
    }
  }

  chrome.storage.onChanged.addListener(changes => {
    if (changes.themes) {
      const el = document.getElementById(`mturk-theme`);
      const href = chrome.extension.getURL(
        `bootstrap/css/${changes.themes.newValue.mturk}.worker.css`
      );

      if (el) {
        el.href = href;
      } else {
        const theme = document.createElement(`link`);
        theme.id = `mturk-theme`;
        theme.rel = `stylesheet`;
        theme.href = href;
        theme.type = `text/css`;
        document.getElementsByTagName(`head`)[0].appendChild(theme);
      }
    }
  });
});

(async function WORKER_ID() {
  chrome.runtime.sendMessage({ workerId: (await new React(`common/CopyText`).props).textToCopy });
})();
