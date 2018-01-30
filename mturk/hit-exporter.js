/* globals chrome storage mturkReact scriptEnabled */

(async () => {
  const enabled = await scriptEnabled(`hitExporter`)
  if (!enabled) return

  const react = await mturkReact(`reactComponents/hitSetTable/HitSetTable`) || await mturkReact(`reactComponents/taskQueueTable/TaskQueueTable`)
  const reactProps = await react.getProps()

  const modal = document.createElement(`div`)
  modal.className = `modal`
  modal.id = `hitExportModal`
  document.body.appendChild(modal)

  const modalDialog = document.createElement(`div`)
  modalDialog.className = `modal-dialog`
  modal.appendChild(modalDialog)

  const modalContent = document.createElement(`div`)
  modalContent.className = `modal-content`
  modalDialog.appendChild(modalContent)

  const modalHeader = document.createElement(`div`)
  modalHeader.className = `modal-header`
  modalContent.appendChild(modalHeader)

  const modalTitle = document.createElement(`h2`)
  modalTitle.className = `modal-title`
  modalTitle.textContent = `HIT Export`
  modalHeader.appendChild(modalTitle)

  const modalBody = document.createElement(`div`)
  modalBody.className = `modal-body`
  modalContent.appendChild(modalBody)

  const modalBodyRow1 = document.createElement(`div`)
  modalBodyRow1.className = `row`
  modalBody.appendChild(modalBodyRow1)
  modalBodyRow1.appendChild(createExportButton(`Short`, `hitExportShort`))
  modalBodyRow1.appendChild(createExportButton(`Plain`, `hitExportPlain`))

  const modalBodyRow2 = document.createElement(`div`)
  modalBodyRow2.className = `row`
  modalBody.appendChild(modalBodyRow2)
  modalBodyRow2.appendChild(createExportButton(`BBCode`, `hitExportBBCode`))
  modalBodyRow2.appendChild(createExportButton(`Markdown`, `hitExportMarkdown`))

  const modalBodyRow3 = document.createElement(`div`)
  modalBodyRow3.className = `row`
  modalBody.appendChild(modalBodyRow3)

  const turkerHub = document.createElement(`div`)
  turkerHub.className = `col-xs-6`
  modalBodyRow3.appendChild(turkerHub)

  const turkerHubExport = document.createElement(`button`)
  turkerHubExport.className = `btn btn-primary btn-hit-export`
  turkerHubExport.textContent = `Turker Hub`
  turkerHubExport.style.width = `100%`
  turkerHubExport.addEventListener(`click`, async (event) => {
    const confirmed = window.confirm(`Are you sure you want to export this HIT to TurkerHub.com?`)

    if (confirmed) {
      chrome.runtime.sendMessage({
        function: `hitExportTurkerHub`,
        arguments: {
          hit: JSON.parse(event.target.dataset.hit)
        }
      })
    }
  })
  turkerHub.appendChild(turkerHubExport)

  const mturkCrowd = document.createElement(`div`)
  mturkCrowd.className = `col-xs-6`
  modalBodyRow3.appendChild(mturkCrowd)

  const mturkCrowdExport = document.createElement(`button`)
  mturkCrowdExport.className = `btn btn-primary btn-hit-export`
  mturkCrowdExport.textContent = `Mturk Crowd`
  mturkCrowdExport.style.width = `100%`
  mturkCrowdExport.addEventListener(`click`, async (event) => {
    const confirmed = window.confirm(`Are you sure you want to export this HIT to MturkCrowd.com?`)

    if (confirmed) {
      chrome.runtime.sendMessage({
        function: `hitExportMTurkCrowd`,
        arguments: {
          hit: JSON.parse(event.target.dataset.hit)
        }
      })
    }
  })
  mturkCrowd.appendChild(mturkCrowdExport)

  const style = document.createElement(`style`)
  style.innerHTML = `.modal-backdrop.in { z-index: 1049; }`
  document.head.appendChild(style)

  const reactElement = await react.getElement()
  const hitRows = reactElement.getElementsByClassName(`table-row`)

  for (let i = 0; i < hitRows.length; i++) {
    const hit = reactProps.bodyData[i].project ? reactProps.bodyData[i].project : reactProps.bodyData[i]
    const project = hitRows[i].getElementsByClassName(`project-name-column`)[0]

    const button = document.createElement(`button`)
    button.className = `btn btn-primary btn-sm fa fa-share`
    button.style.marginRight = `5px`
    project.prepend(button)

    if (storage.exports === `all`) {
      button.dataset.toggle = `modal`
      button.dataset.target = `#hitExportModal`
      button.addEventListener(`click`, (event) => {
        event.target.closest(`.desktop-row`).click()

        for (const element of document.getElementsByClassName(`btn-hit-export`)) {
          element.dataset.hit = JSON.stringify(hit)
        }
      })
    } else {
      button.addEventListener(`click`, (event) => {
        event.target.closest(`.desktop-row`).click()

        const pairs = {
          short: `hitExportShort`,
          plain: `hitExportPlain`,
          bbcode: `hitExportBBCode`,
          markdown: `hitExportMarkdown`,
          turkerhub: `hitExportTurkerHub`,
          mturkcrowd: `hitExportMTurkCrowd`
        }

        if ((storage.exports === `hitExportTurkerHub` || storage.exports === `hitExportMturkCrowd`)) {
          const confirmed = window.confirm(`Are you sure you want to export this HIT to ${storage.exports === `hitExportTurkerHub` ? `TurkerHub` : `MTurkCrowd`}.com?`)
          if (!confirmed) return
        }

        chrome.runtime.sendMessage({
          function: pairs[storage.exports],
          arguments: {
            hit: hit
          }
        })
      })
    }
  }

  function createExportButton (stringText, stringFunction) {
    const div = document.createElement(`div`)
    div.className = `col-xs-6`

    const button = document.createElement(`button`)
    button.className = `btn btn-primary btn-hit-export`
    button.textContent = stringText
    button.style.width = `100%`
    button.addEventListener(`click`, (event) => {
      chrome.runtime.sendMessage({
        function: stringFunction,
        arguments: {
          hit: JSON.parse(event.target.dataset.hit)
        }
      })
    })
    div.appendChild(button)

    return div
  }
})()
