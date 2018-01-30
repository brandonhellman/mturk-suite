/* globals mturkReact scriptEnabled */

(async function () {
  const enabled = await scriptEnabled(`autoAcceptChecker`)
  if (!enabled) return

  const react = await mturkReact(`reactComponents/workPipeline/AutoAcceptCheckbox`)
  const reactElement = await react.getElement()

  const checkbox = reactElement.getElementsByTagName(`input`)[0]

  if (checkbox.checked === false) {
    checkbox.click()
  }
})()
