/* globals chrome */

const storage = {}

chrome.storage.local.get([`earnings`, `exports`, `reviews`, `scripts`], (keys) => {
  for (const key of Object.keys(keys)) {
    storage[key] = keys[key]
  }

  storage.readyState = `complete`
})
