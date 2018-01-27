(function () {
  const theme = document.createElement(`link`)
  theme.rel = `stylesheet`
  document.head.prepend(theme)

  window.chrome.storage.local.get([`themes`], (keys) => {
    theme.href = `/bootstrap/css/${keys.themes.mts}.min.css`

    window.chrome.storage.onChanged.addListener((changes) => {
      if (changes.themes) {
        theme.href = `/bootstrap/css/${changes.themes.newValue.mts}.min.css`
      }
    })
  })
})()
