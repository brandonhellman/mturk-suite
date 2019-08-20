$(document).on(`show.bs.modal`, `.modal`, (event) => {
  const zIndex = 1040 + (10 * document.querySelectorAll(`.modal-backdrop, .show`).length)

  event.target.style.zIndex = zIndex

  setTimeout(() => {
    for (const backdrop of document.getElementsByClassName(`modal-backdrop`)) {
      const classList = backdrop.classList

      if (!classList.contains(`modal-stack`)) {
        classList.add(`modal-stack`)
        backdrop.style.zIndex = zIndex - 1
      }
    }
  })
})
