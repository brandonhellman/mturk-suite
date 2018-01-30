/* globals mturkReact scriptEnabled */

(async function () {
  const enabled = await scriptEnabled(`queueInfoEnhancer`)
  if (!enabled) return

  const react = await mturkReact(`reactComponents/taskQueueTable/TaskQueueTable`)
  const reactProps = await react.getProps()
  const queueValue = reactProps.bodyData.reduce((accumulator, currentValue) => accumulator + currentValue.project.monetary_reward.amount_in_dollars, 0)

  const header = document.getElementsByClassName(`task-queue-header`)[0].getElementsByClassName(`m-b-0`)[0]
  header.textContent = `${header.textContent.trim().slice(0, -1)} - $${queueValue.toFixed(2)})`
})()
