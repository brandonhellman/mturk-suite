/* globals chrome */

(function getVersion () {
  document.getElementById(`version`).textContent = `v${chrome.runtime.getManifest().version}`
})();

(function checkForUpdateAvailable () {
  chrome.runtime.sendMessage({ checkForUpdateAvailable: true }, (response) => {
    if (response) {
      const update = document.createElement(`button`)
      update.className = `btn btn-sm btn-success fa fa-arrow-alt-circle-up float-right`
      update.addEventListener(`click`, (event) => {
        chrome.runtime.reload()
      })
      document.getElementById(`version`).parentElement.appendChild(update)
    }
  })
})()
