/* globals chrome mturkReact scriptEnabled */

(async function () {
  const enabled = await scriptEnabled(`blockListOnMturk`)
  if (!enabled) return

  const react = await mturkReact(`reactComponents/hitSetTable/HitSetTable`)
  const reactProps = await react.getProps()

  const blockList = await new Promise((resolve) => chrome.storage.local.get([`blockList`], (keys) => resolve(keys.blockList)))

  const blocked = reactProps.bodyData.reduce((accumulator, currentValue, currentIndex) => {
    if (blockListed(currentValue)) {
      accumulator.push(currentIndex)
    }
    return accumulator
  }, [])

  const reactElement = await react.getElement()
  const hits = reactElement.getElementsByClassName(`hit-set-table-row`)

  for (const i of blocked) {
    const hit = hits[i]
    hit.classList.add(`blocked`)
    hit.style.display = `none`
  }

  const toggle = document.createElement(`span`)
  toggle.className = `expand-projects-button`
  toggle.addEventListener(`click`, (event) => {
    for (const i of blocked) {
      const hit = hits[i]
      hit.style.display = hit.style.display === `none` ? `` : `none`
    }

    icon.classList.toggle(`fa-plus-circle`)
    icon.classList.toggle(`fa-minus-circle`)
    text.textContent = `${~text.textContent.indexOf(`Show`) ? `Hide` : `Show`} Blocked (${blocked.length})`
  })

  const link = document.createElement(`a`)
  link.href = `#`
  link.className = `table-expand-collapse-button`
  toggle.appendChild(link)

  const icon = document.createElement(`i`)
  icon.className = `fa fa-plus-circle`
  link.appendChild(icon)

  const text = document.createElement(`span`)
  text.className = `button-text`
  text.textContent = `Show Blocked (${blocked.length})`
  link.appendChild(text)

  document.getElementsByClassName(`expand-collapse-projects-holder`)[0].prepend(toggle)

  function blockListed () {
    const [hit] = arguments

    const checks = [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title]

    for (const key of Object.keys(blockList)) {
      const bl = blockList[key]
      const match = bl.match

      if (bl.strict) {
        for (const check of checks) if (check === match) return true
      } else {
        for (const check of checks) if (~check.toLowerCase().indexOf(match.toLowerCase)) return true
      }
    }

    return false
  }
})()
