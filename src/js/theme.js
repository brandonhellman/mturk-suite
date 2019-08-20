/* globals chrome */

(function themee() {
  const theme = document.createElement(`link`);
  theme.rel = `stylesheet`;
  document.head.prepend(theme);

  chrome.storage.local.get([`options`], keys => {
    theme.href = `/bootstrap/css/${keys.options.themeMts}.min.css`;

    chrome.storage.onChanged.addListener(changes => {
      if (changes.options) {
        theme.href = `/bootstrap/css/${changes.options.newValue.themeMts}.min.css`;
      }
    });
  });
})();
