/* globals scriptEnabled */

(async function () {
  const enabled = await scriptEnabled(`confirmReturnHIT`)
  if (!enabled) return

  document.addEventListener(`submit`, (event) => {
    const returning = event.target.querySelector(`[value="delete"]`)

    if (returning) {
      event.preventDefault()

      const confirmed = window.confirm(`Are you sure you want to return this HIT?`)

      if (confirmed) {
        event.target.submit()
      }
    }
  })
})()
