/* globals mturkReact scriptEnabled */

(async function () {
  const enabled = await scriptEnabled(`hitDetailsEnhancer`)
  if (!enabled) return

  const react = await mturkReact(`reactComponents/common/ShowModal`)
  const reactProps = await react.getProps()
  const react2 = await mturkReact(`reactComponents/modal/MTurkWorkerModal`)

  const detailBar = document.getElementsByClassName(`project-detail-bar`)[0].getElementsByClassName(`row`)[0]

  const detailBarRight = detailBar.children[1].getElementsByClassName(`row`)[0]
  detailBarRight.children[0].className = `col-xs-4 text-xs-center col-md-4 text-md-center`
  detailBarRight.children[1].className = `col-xs-4 text-xs-center col-md-4 text-md-right`

  const available = document.createElement(`div`)
  available.className = `col-xs-4 text-xs-center col-md-4 text-md-center`

  const availableLabel = document.createElement(`span`)
  availableLabel.className = `detail-bar-label`
  availableLabel.textContent = `HITs: `
  available.appendChild(availableLabel)

  const availableValue = document.createElement(`span`)
  availableValue.className = `detail-bar-value`
  availableValue.textContent = reactProps.modalOptions.assignableHitsCount
  available.appendChild(availableValue)

  detailBarRight.insertBefore(available, detailBarRight.children[1])

  const observer = new window.MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const addedNode = mutation.addedNodes[0]

      if (addedNode.matches(`#modalProjectDetailsModal`)) {
        const requester = addedNode.querySelector(`[data-reactid=".8.0.0.1.0.0.1"]`)
        const requesterId = new window.URLSearchParams(reactProps.modalOptions.contactRequesterUrl).get(`hit_type_message[requester_id]`)

        const link = document.createElement(`a`)
        link.href = `https://worker.mturk.com/requesters/${requesterId}/projects`
        link.target = `_blank`
        link.textContent = reactProps.modalOptions.requesterName

        requester.replaceWith(link)
      }
    })
  })

  const reactElement = await react.getElement()
  reactElement.children[0].textContent = reactProps.modalOptions.requesterName

  const react2Element = await react2.getElement()
  observer.observe(react2Element, { childList: true })
})()
