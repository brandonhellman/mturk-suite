/* globals chrome mturkReact */

(async function () {
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    const hitSetId = request.hitMissed

    if (hitSetId) {
      const once = document.createElement(`button`)
      once.className = `btn btn-primary`
      once.textContent = `Once`
      once.style.marginLeft = `5px`
      once.addEventListener(`click`, (event) => {
        chrome.runtime.sendMessage({
          hitCatcher: {
            id: hitSetId,
            name: ``,
            once: true,
            sound: true
          }
        })
      })

      const panda = document.createElement(`button`)
      panda.className = `btn btn-primary`
      panda.textContent = `Panda`
      panda.style.marginLeft = `5px`
      panda.addEventListener(`click`, (event) => {
        chrome.runtime.sendMessage({
          hitCatcher: {
            id: hitSetId,
            name: ``,
            once: false,
            sound: false
          }
        })
      })

      const react = await mturkReact(`reactComponents/alert/Alert`)
      const reactElement = await react.getElement()
      reactElement.getElementsByTagName(`h3`)[0].appendChild(once)
      reactElement.getElementsByTagName(`h3`)[0].appendChild(panda)
    }
  })
})()
