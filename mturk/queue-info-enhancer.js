(async function () {
  await ready({ enabled: `queueInfoEnhancer` })

  const react = await require(`reactComponents/taskQueueTable/TaskQueueTable`)

  const total = react.reactProps.bodyData
  .map((currentValue) => currentValue.project.monetary_reward.amount_in_dollars)
  .reduce((accumulator, currentValue) => accumulator + currentValue, 0)

  const header = document.getElementsByClassName(`task-queue-header`)[0].getElementsByClassName(`m-b-0`)[0]
  header.textContent = `${header.textContent.trim().slice(0, -1)} - $${total.toFixed(2)})`
})()
