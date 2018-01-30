/* globals chrome mturkReact */

(async function () {
  const react = await mturkReact(`reactComponents/common/CopyText`)
  const reactProps = await react.getProps()

  chrome.storage.local.set({
    workerId: reactProps.textToCopy
  })
})()
