(async function () {
  const react = await require(`reactComponents/common/CopyText`)

  window.chrome.storage.local.set({
    workerId: react.reactProps.textToCopy
  })
})()
