/* globals chrome */

(function getVersion () {
  document.getElementById(`version`).textContent = `v${chrome.runtime.getManifest().version}`
})()
