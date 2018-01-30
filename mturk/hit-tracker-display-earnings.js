/* globals chrome storage scriptEnabled */

(async function () {
  const enabled = await scriptEnabled(`hitTracker`)
  if (!enabled) return

  const span = document.createElement(`span`)
  span.textContent = `Earnings: `

  const link = document.createElement(`a`)
  link.href = `#`
  link.textContent = `$${storage.earnings.toFixed(2)}`
  link.addEventListener(`click`, (event) => {
    event.preventDefault()

    chrome.runtime.sendMessage({function: `openTracker`})
  })

  const spacer = document.createElement(`span`)
  spacer.textContent = ` | `

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.earnings) {
      link.textContent = `$${changes.earnings.newValue.toFixed(2)}`
    }
  })

  const element = document.getElementsByClassName(`col-xs-7`)[0]
  element.appendChild(spacer)
  element.appendChild(span)
  element.appendChild(link)
})()
