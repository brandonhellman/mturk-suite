/* globals chrome mturkReact scriptEnabled */

(async function () {
  const enabled = await scriptEnabled(`hitTracker`)
  if (!enabled) return

  const react = await mturkReact(`reactComponents/hitSetTable/HitSetTable`) || await mturkReact(`reactComponents/taskQueueTable/TaskQueueTable`)
  const reactProps = await react.getProps()

  const trackerCompareValues = reactProps.bodyData.reduce((accumulator, currentValue) => {
    const project = currentValue.project || currentValue

    const requesterId = project.requester_id
    const title = project.title

    if (!accumulator.requester_id.includes(requesterId)) accumulator.requester_id.push(requesterId)
    if (!accumulator.title.includes(title)) accumulator.title.push(title)

    return accumulator
  }, { requester_id: [], title: [] })

  const counts = await new Promise((resolve) => chrome.runtime.sendMessage({
    function: `hitTrackerGetCounts`,
    arguments: trackerCompareValues
  }, resolve))

  const reactElement = await react.getElement()
  const hitRows = reactElement.getElementsByClassName(`table-row`)

  for (let i = 0; i < hitRows.length; i++) {
    const hit = reactProps.bodyData[i].project || reactProps.bodyData[i]
    const trackerR = counts[hit.requester_id]
    const trackerT = counts[hit.title]

    const appR = trackerR.Paid || trackerR.Approved
    const rejR = trackerR.Rejected
    const lenR = Object.keys(trackerR).length

    const requester = document.createElement(`span`)
    requester.className = `btn btn-sm fa ${appR ? `fa-check btn-success` : rejR ? `fa-exclamation btn-info` : `fa-${lenR ? `question` : `minus`} btn-secondary`}`
    requester.style.marginRight = `5px`

    const requesterScript = document.createElement(`script`)
    requesterScript.textContent = `$(document.currentScript).parent().popover({ html: true, trigger: \`hover\`, title: \`${hit.requester_name} [${hit.requester_id}]\`, content: \`<div class="container">${popoverText(trackerR)}</div>\` });`
    requester.appendChild(requesterScript)

    const requesterEl = hitRows[i].querySelector(`a[href^="/requesters/"]`)
    requesterEl.parentElement.insertBefore(requester, requesterEl)

    const appT = trackerT.Paid || trackerT.Approved
    const rejT = trackerT.Rejected
    const lenT = Object.keys(trackerT).length

    const title = document.createElement(`span`)
    title.className = `btn btn-sm fa ${appT ? `fa-check btn-success` : rejT ? `fa-exclamation btn-info` : `fa-${lenT ? `question` : `minus`} btn-secondary`}`
    title.style.marginRight = `5px`

    const titleScript = document.createElement(`script`)
    titleScript.textContent = `$(document.currentScript).parent().popover({ html: true, trigger: \`hover\`, title: \`${hit.title}\`, content: \`<div class="container">${popoverText(trackerT)}</div>\` });`
    title.appendChild(titleScript)

    const titleEl = hitRows[i].getElementsByClassName(`project-name-column`)[0].lastChild
    titleEl.parentElement.insertBefore(title, titleEl)
  }

  const style = document.createElement(`style`)
  style.innerHTML = `.popover { max-width: 1000px; }`
  document.head.appendChild(style)

  function popoverText () {
    const [counts] = arguments

    let template = ``

    for (const key in counts) {
      template += `<div class="row">${key}: ${counts[key]}</div>`
    }

    return template === `` ? `No Work Found` : template
  }
})()
