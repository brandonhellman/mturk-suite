const finderDB = {}
const reviewsDB = {}
const includeAlerted = []
const includePushbulleted = []

let totalScans = 0
let pageRequestErrors = 0
let alarm = false
let alarmAudio = null
let alarmRunning = false
let finderTimeout = null

const storage = {}

window.chrome.storage.local.get([`hitFinder`, `blockList`, `includeList`, `reviews`], (keys) => {
  for (const key of Object.keys(keys)) {
    storage[key] = keys[key]
  }

  finderUpdate()
  blockListUpdate()
  includeListUpdate()

  window.chrome.storage.onChanged.addListener((changes) => {
    if (changes.reviews) {
      storage.reviews = changes.reviews.newValue
      updateRequesterReviews(reviewsDB)
    }
  })
})

function finderApply () {
  for (const prop in storage.hitFinder) {
    storage.hitFinder[prop] = document.getElementById(prop)[typeof (storage.hitFinder[prop]) === `boolean` ? `checked` : `value`]
  }

  window.chrome.storage.local.set({
    hitFinder: storage.hitFinder
  })
}

function finderUpdate () {
  for (const prop in storage.hitFinder) {
    document.getElementById(prop)[typeof (storage.hitFinder[prop]) === `boolean` ? `checked` : `value`] = storage.hitFinder[prop]
  }
}

function finderToggle () {
  const active = document.getElementById(`find`).classList.toggle(`active`)

  if (active) {
    finderFetch()
  }
}

function finderFetchURL () {
  const url = new window.URL(`https://worker.mturk.com/`)
  url.searchParams.append(`sort`, storage.hitFinder[`filter-sort`])
  url.searchParams.append(`page_size`, storage.hitFinder[`filter-page-size`])
  url.searchParams.append(`filters[masters]`, storage.hitFinder[`filter-masters`])
  url.searchParams.append(`filters[qualified]`, storage.hitFinder[`filter-qualified`])
  url.searchParams.append(`filters[min_reward]`, storage.hitFinder[`filter-min-reward`])
  url.searchParams.append(`filters[search_term]`, storage.hitFinder[`filter-search-term`])
  url.searchParams.append(`format`, `json`)

  return url
}

function finderNextFetch () {
  const [lastScan] = arguments

  const speed = Number(storage.hitFinder[`speed`])

  if (speed > 0) {
    const delay = lastScan + speed - window.performance.now()
    finderTimeout = setTimeout(finderFetch, delay)
  } else {
    finderToggle()
  }
}

function finderLoggedOut () {
  finderToggle()
  window.textToSpeech(`HIT Finder Stopped, you are logged out of MTurk.`)
}

async function finderFetch () {
  const start = window.performance.now()

  clearTimeout(finderTimeout)

  if (!document.getElementById(`find`).classList.contains(`active`)) {
    return
  }

  try {
    const response = await window.fetch(finderFetchURL(), {
      credentials: `include`
    })

    if (~response.url.indexOf(`https://worker.mturk.com`)) {
      if (response.ok) {
        finderProcess(await response.json())
      }
      if (response.status === 429) {
        document.getElementById(`page-request-errors`).textContent = ++pageRequestErrors
      }

      finderNextFetch(start)
    } else {
      finderLoggedOut()
    }
  } catch (error) {
    console.error(error)
    finderNextFetch(start)
  } finally {
    document.getElementById(`total-scans`).textContent = ++totalScans
  }
}

async function finderProcess () {
  const [json] = arguments

  const recentFragment = document.createDocumentFragment()
  const loggedFragment = document.createDocumentFragment()
  const includedFragment = document.createDocumentFragment()
  let sound = false
  let blocked = 0

  requesterReviewsCheck([...new Set(json.results.map((o) => o.requester_id))])

  for (const hit of json.results) {
    if (blockListed(hit) || minimumAvailable(hit) || minimumRequesterRating(hit)) {
      blocked++
      continue
    }

    const included = includeListed(hit)
    const requesterReviewClass = requesterReviewGetClass(hit.requester_id)
    const trackerRequester = await hitTrackerMatchObject(`requester_id`, hit.requester_id)
    const trackerTitle = await hitTrackerMatchObject(`title`, hit.title)

    const row = document.createElement(`tr`)

    if (included) {
      row.classList.add(`included`)
    }

    if (storage.hitFinder[`display-colored-rows`]) {
      row.classList.add(`table-${requesterReviewClass}`)
    }

    const actions = document.createElement(`td`)
    actions.className = `w-1`
    row.appendChild(actions)

    const actionsContainer = document.createElement(`div`)
    actionsContainer.className = `btn-group`
    actions.appendChild(actionsContainer)

    const hitInfo = document.createElement(`button`)
    hitInfo.type = `button`
    hitInfo.className = `btn btn-sm btn-primary`
    hitInfo.dataset.toggle = `modal`
    hitInfo.dataset.target = `#hit-info-modal`
    hitInfo.dataset.key = hit.hit_set_id
    actionsContainer.appendChild(hitInfo)

    const hitInfoIcon = document.createElement(`i`)
    hitInfoIcon.className = `fas fa-info-circle`
    hitInfo.appendChild(hitInfoIcon)

    const time = document.createElement(`td`)
    time.className = `w-1`
    time.textContent = timeNow()
    row.appendChild(time)

    const requester = document.createElement(`td`)
    row.appendChild(requester)

    const requesterContainer = document.createElement(`div`)
    requesterContainer.className = `btn-group`
    requester.appendChild(requesterContainer)

    const requesterReviews = document.createElement(`button`)
    requesterReviews.className = `btn btn-sm btn-${hit.requester_id} btn-${requesterReviewClass}`
    requesterReviews.dataset.toggle = `modal`
    requesterReviews.dataset.target = `#requester-review-modal`
    requesterReviews.dataset.key = hit.requester_id
    requesterContainer.appendChild(requesterReviews)

    const requesterReviewsIcon = document.createElement(`i`)
    requesterReviewsIcon.className = `fas fa-user`
    requesterReviews.appendChild(requesterReviewsIcon)

    const requesterTracker = document.createElement(`button`)
    requesterTracker.type = `button`
    requesterTracker.className = `btn btn-sm btn-${trackerRequester.color} mr-1`
    requesterContainer.appendChild(requesterTracker)

    const requesterTrackerIcon = document.createElement(`i`)
    requesterTrackerIcon.className = `fas fa-${trackerRequester.icon}`
    requesterTracker.appendChild(requesterTrackerIcon)

    const requesterLink = document.createElement(`a`)
    requesterLink.href = `https://worker.mturk.com/requesters/${hit.requester_id}/projects`
    requesterLink.target = `_blank`
    requesterLink.textContent = hit.requester_name
    requesterContainer.appendChild(requesterLink)

    const title = document.createElement(`td`)
    row.appendChild(title)

    const titleContainer = document.createElement(`div`)
    titleContainer.className = `btn-group`
    title.appendChild(titleContainer)

    const sharer = document.createElement(`button`)
    sharer.type = `button`
    sharer.className = `btn btn-sm btn-primary`
    sharer.dataset.toggle = `modal`
    sharer.dataset.target = `#hit-sharer-modal`
    sharer.dataset.key = hit.hit_set_id
    titleContainer.appendChild(sharer)

    const shareIcon = document.createElement(`i`)
    shareIcon.className = `fas fa-share`
    sharer.appendChild(shareIcon)

    const titleTracker = document.createElement(`button`)
    titleTracker.type = `button`
    titleTracker.className = `btn btn-sm btn-${trackerTitle.color} mr-1`
    titleContainer.appendChild(titleTracker)

    const titleTrackerIcon = document.createElement(`i`)
    titleTrackerIcon.className = `fas fa-${trackerTitle.icon}`
    titleTracker.appendChild(titleTrackerIcon)

    const titleLink = document.createElement(`a`)
    titleLink.href = `https://worker.mturk.com/projects/${hit.hit_set_id}/tasks`
    titleLink.target = `_blank`
    titleLink.textContent = hit.title
    titleContainer.appendChild(titleLink)

    const available = document.createElement(`td`)
    available.className = `text-center w-1`
    available.textContent = hit.assignable_hits_count
    row.appendChild(available)

    const reward = document.createElement(`td`)
    reward.className = `text-center`
    row.appendChild(reward)

    const rewardLink = document.createElement(`a`)
    rewardLink.href = `https://worker.mturk.com/projects/${hit.hit_set_id}/tasks/accept_random`
    rewardLink.target = `_blank`
    rewardLink.textContent = toMoneyString(hit.monetary_reward.amount_in_dollars)
    reward.appendChild(rewardLink)

    const masters = document.createElement(`td`)
    masters.className = `text-center w-1`
    masters.textContent = hit.project_requirements.filter((o) => [`2F1QJWKUDD8XADTFD2Q0G6UTO95ALH`, `2NDP2L92HECWY8NS8H3CK0CP5L9GHO`, `21VZU98JHSTLZ5BPP4A9NOBJEK3DPG`].includes(o.qualification_type_id)).length > 0 ? `Y` : `N`
    row.appendChild(masters)

    const recentRow = toggleColumns(row.cloneNode(true), `recent`)
    recentRow.id = `recent-${hit.hit_set_id}`

    const loggedRow = toggleColumns(row.cloneNode(true), `logged`)
    loggedRow.id = `logged-${hit.hit_set_id}`

    const includedRow = toggleColumns(row.cloneNode(true), `included`)
    includedRow.id = `included-${hit.hit_set_id}`

    recentFragment.appendChild(recentRow)

    if (finderDB[hit.hit_set_id] === undefined) {
      sound = true
      finderDB[hit.hit_set_id] = hit
      loggedFragment.appendChild(loggedRow)
    } else {
      document.getElementById(`logged-${hit.hit_set_id}`).replaceWith(loggedRow)
    }

    if (included && !includeAlerted.includes(hit.hit_set_id)) {
      includedAlert(included, hit)
      document.getElementById(`include-list-hits-card`).style.display = ``
      includedFragment.appendChild(includedRow)
    }
  }

  toggleColumns(document.getElementById(`recent-hits-thead`).children[0], `recent`)
  toggleColumns(document.getElementById(`logged-hits-thead`).children[0], `logged`)
  removeChildren(document.getElementById(`recent-hits-tbody`))

  document.getElementById(`recent-hits-tbody`).insertBefore(recentFragment, document.getElementById(`recent-hits-tbody`).firstChild)
  document.getElementById(`logged-hits-tbody`).insertBefore(loggedFragment, document.getElementById(`logged-hits-tbody`).firstChild)
  document.getElementById(`include-list-hits-tbody`).insertBefore(includedFragment, document.getElementById(`include-list-hits-tbody`).firstChild)

  if (sound && storage.hitFinder[`alert-new-sound`] !== `none`) {
    const audio = new window.Audio()
    audio.src = `/media/audio/${storage.hitFinder[`alert-new-sound`]}.ogg`
    audio.play()
  }

  document.getElementById(`hits-found`).textContent = `Found: ${json.num_results} | Blocked: ${blocked} | ${new Date().toLocaleTimeString()}`
  document.getElementById(`hits-logged`).textContent = document.getElementById(`logged-hits-tbody`).children.length
}

function minimumAvailable () {
  const [hit] = arguments

  if (hit.assignable_hits_count < Number(storage.hitFinder[`filter-min-available`])) {
    return true
  }

  return false
}

function minimumRequesterRating () {
  const [hit] = arguments

  const ratingAverage = requesterRatingAverage(hit.requester_id)

  if (ratingAverage > 0 && ratingAverage < Number(storage.hitFinder[`filter-min-requester-rating`])) {
    console.log(`ratingAverage`, ratingAverage)
    return true
  }

  return false
}

function blockListed (hit) {
  for (const match in storage.blockList) {
    const bl = storage.blockList[match]
    if (bl.strict) {
      const compared = strictCompare(match, [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title])
      if (compared === true) {
        return true
      }
    } else {
      const compared = looseCompare(match, [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title])
      if (compared === true) {
        return true
      }
    }
  }
  return false
}

function includeListed (hit) {
  for (const match in storage.includeList) {
    const il = storage.includeList[match]
    if (il.strict) {
      const compared = strictCompare(match, [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title])
      if (compared === true) {
        return il
      }
    } else {
      const compared = looseCompare(match, [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title])
      if (compared === true) {
        return il
      }
    }
  }
  return false
}

function includedAlert (il, hit) {
  const alerted = includeAlerted.includes(hit.hit_set_id)
  const pushbulleted = includePushbulleted.includes(hit.hit_set_id)

  if (alarm && il.alarm === true) {
    alarmSound()
  }

  if (alerted) {
    return
  }

  if (il.sound === true) {
    if (storage.hitFinder[`alert-include-sound`] === `voice`) {
      window.textToSpeech(`Include list match found! ${il.name}`)
    } else {
      const audio = new window.Audio()
      audio.src = `/media/audio/${storage.hitFinder[`alert-include-sound`]}.ogg`
      audio.play()
    }
  }

  if (il.notification) {
    window.chrome.notifications.create(
            hit.hit_set_id,
      {
        type: `list`,
        title: `Include list match found!`,
        message: `Match`,
        iconUrl: `/media/icon_128.png`,
        items: [
                    { title: `Title`, message: hit.title },
                    { title: `Requester`, message: hit.requester_name },
                    { title: `Reward`, message: toMoneyString(hit.monetary_reward.amount_in_dollars) },
                    { title: `Available`, message: hit.assignable_hits_count.toString() }
        ],
        buttons: [
                    { title: `Preview` },
                    { title: `Accept` }
        ]
      },
            (id) => {
              setTimeout(() => {
                window.chrome.notifications.clear(id)
              }, 15000)
            }
        )
  }

  if (il.pushbullet && storage.hitFinder[`alert-pushbullet-state`] === `on` && pushbulleted === false) {
    $.ajax({
      type: `POST`,
      url: `https://api.pushbullet.com/v2/pushes`,
      headers: {
        Authorization: `Bearer ${storage.hitFinder[`alert-pushbullet-token`]}`
      },
      data: {
        type: `note`,
        title: `Include list match found!`,
        body: `Title: ${hit.title}\nReq: ${hit.requester_name}\nReward: ${toMoneyString(hit.monetary_reward.amount_in_dollars)}\nAvail: ${hit.assignable_hits_count}`
      }
    })

    includePushbulleted.unshift(hit.hit_set_id)

    setTimeout(() => {
      includePushbulleted.pop()
    }, 900000)
  }

  includeAlerted.unshift(hit.hit_set_id)

  setTimeout(() => {
    includeAlerted.pop()
  }, Number(storage.hitFinder[`alert-delay`]) * 60000)
}

function strictCompare (string, array) {
  for (const value of array) {
    if (string === value) {
      return true
    }
  }
  return false
}

function looseCompare (string, array) {
  for (const value of array) {
    if (value.toLowerCase().indexOf(string.toLowerCase()) !== -1) {
      return true
    }
  }
  return false
}

function alarmSound () {
  if (!alarm || alarmRunning) {
    return
  }

  alarmAudio = new window.Audio()
  alarmAudio.src = `/media/audio/alarm.ogg`
  alarmAudio.loop = true
  alarmAudio.play()

  alarmRunning = true
}

function blockListUpdate () {
  const sorted = Object.keys(storage.blockList).map((currentValue) => {
    storage.blockList[currentValue].term = currentValue
    return storage.blockList[currentValue]
  }).sort((a, b) => a.name.localeCompare(b.name, `en`, { numeric: true }))

  const body = document.getElementById(`block-list-modal`).getElementsByClassName(`modal-body`)[0]

  while (body.firstChild) {
    body.removeChild(body.firstChild)
  }

  body.appendChild((() => {
    const fragment = document.createDocumentFragment()

    for (const bl of sorted) {
      const button = document.createElement(`button`)
      button.type = `button`
      button.className = `btn btn-sm btn-danger ml-1 my-1 bl-btn`
      button.textContent = bl.name
      button.dataset.toggle = `modal`
      button.dataset.target = `#block-list-edit-modal`
      button.dataset.key = bl.match
      fragment.appendChild(button)
    }

    return fragment
  })())

  for (const key in finderDB) {
    const hit = finderDB[key]

    if (blockListed(hit)) {
      const recent = document.getElementById(`recent-${hit.hit_set_id}`)
      const logged = document.getElementById(`logged-${hit.hit_set_id}`)
      const included = document.getElementById(`included-${hit.hit_set_id}`)

      if (recent) recent.parentNode.removeChild(recent)
      if (logged) logged.parentNode.removeChild(logged)
      if (included) included.parentNode.removeChild(included)

      delete finderDB[key]
    }
  }

  window.chrome.storage.local.set({
    blockList: storage.blockList
  })
}

function includeListUpdate () {
  const sorted = Object.keys(storage.includeList).map((currentValue) => {
    storage.includeList[currentValue].match = currentValue
    return storage.includeList[currentValue]
  }).sort((a, b) => a.name.localeCompare(b.name, `en`, { numeric: true }))

  const body = document.getElementById(`include-list-modal`).getElementsByClassName(`modal-body`)[0]

  while (body.firstChild) {
    body.removeChild(body.firstChild)
  }

  body.appendChild((() => {
    const fragment = document.createDocumentFragment()

    for (const il of sorted) {
      const button = document.createElement(`button`)
      button.type = `button`
      button.className = `btn btn-sm btn-success ml-1 my-1 il-btn`
      button.textContent = il.name
      button.dataset.toggle = `modal`
      button.dataset.target = `#include-list-edit-modal`
      button.dataset.key = il.match
      fragment.appendChild(button)
    }

    return fragment
  })())

  for (const key in finderDB) {
    const hit = finderDB[key]

    const element = document.getElementById(`logged-${hit.hit_set_id}`)

    if (element) {
      if (includeListed(hit)) {
        element.classList.add(`included`)
      } else {
        element.classList.remove(`included`)
      }
    }
  }

  window.chrome.storage.local.set({
    includeList: storage.includeList
  })
}

function timeNow () {
  const date = new Date()
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let ampm = hours >= 12 ? `p` : `a`
  hours = hours % 12
  hours = hours || 12
  minutes = minutes < 10 ? `0` + minutes : minutes
  return `${hours}:${minutes}${ampm}`
}

function toggleColumns () {
  const [element, type] = arguments

  element.children[1].style.display = storage.hitFinder[`display-${type}-column-time`] ? `` : `none`
  element.children[2].style.display = storage.hitFinder[`display-${type}-column-requester`] ? `` : `none`
  element.children[3].style.display = storage.hitFinder[`display-${type}-column-title`] ? `` : `none`
  element.children[4].style.display = storage.hitFinder[`display-${type}-column-available`] ? `` : `none`
  element.children[5].style.display = storage.hitFinder[`display-${type}-column-reward`] ? `` : `none`
  element.children[6].style.display = storage.hitFinder[`display-${type}-column-masters`] ? `` : `none`

  return element
}

function removeChildren () {
  const [element] = arguments

  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

function toMoneyString () {
  const [string] = arguments
  return `$${Number(string).toFixed(2).toLocaleString(`en-US`, { minimumFractionDigits: 2 })}`
}

function toDurationString () {
  const [string] = arguments

  let seconds = string
  let minute = Math.floor(seconds / 60)
  seconds = seconds % 60
  let hour = Math.floor(minute / 60)
  minute = minute % 60
  let day = Math.floor(hour / 24)
  hour = hour % 24

  let durationString = ``

  if (day > 0) durationString += `${day} day${day > 1 ? `s` : ``} `
  if (hour > 0) durationString += `${hour} hour${hour > 1 ? `s` : ``} `
  if (minute > 0) durationString += `${minute} minute${minute > 1 ? `s` : ``}`

  return durationString.trim()
}

window.chrome.notifications.onButtonClicked.addListener((id, btn) => {
  if (btn === 0) {
    window.open(`https://worker.mturk.com/projects/${id}/tasks`)
  }
  if (btn === 1) {
    window.open(`https://worker.mturk.com/projects/${id}/tasks/accept_random`)
  }

  window.chrome.notifications.clear(id)
})

let requesterReviewsDB = (() => {
  const open = window.indexedDB.open(`requesterReviewsDB`, 1)

  open.onsuccess = (event) => {
    requesterReviewsDB = event.target.result

    const transaction = requesterReviewsDB.transaction([`requester`], `readonly`)
    const objectStore = transaction.objectStore(`requester`)
    const request = objectStore.getAll()

    request.onsuccess = (event) => {
      if (event.target.result) {
        for (const review of event.target.result) {
          reviewsDB[review.id] = review
        }
      }
    }
  }
})()

function requesterReviewsCheck (requesters) {
  const time = new Date().getTime()
  const reviews = {}
  const transaction = requesterReviewsDB.transaction([`requester`], `readonly`)
  const objectStore = transaction.objectStore(`requester`)

  let update = false

  for (let i = 0; i < requesters.length; i++) {
    const id = requesters[i]
    const request = objectStore.get(id)

    request.onsuccess = (event) => {
      if (event.target.result) {
        reviews[id] = event.target.result

        if (event.target.result.time < (time - 3600000 / 2)) {
          update = true
        }
      } else {
        reviews[id] = {
          id: id
        }
        update = true
      }
    }
  }

  transaction.oncomplete = async (event) => {
    if (update) {
      const updatedReviews = await requesterReviewsUpdate(reviews, requesters)
      updateRequesterReviews(updatedReviews)
    }
  }
}

function requesterReviewsUpdate (objectReviews, arrayIds) {
  return new Promise(async (resolve) => {
    function getReviews (stringSite, stringURL) {
      return new Promise(async (resolve) => {
        try {
          const response = await window.fetch(stringURL)

          if (response.status === 200) {
            const json = await response.json()
            resolve([stringSite, json.data ? Object.assign(...json.data.map((item) => ({
              [item.id]: item.attributes.aggregates
            }))) : json])
          } else {
            resolve()
          }
        } catch (error) {
          resolve()
        }
      })
    }

    const getReviewsAll = await Promise.all([
      getReviews(`turkerview`, `https://api.turkerview.com/api/v1/requesters/?ids=${arrayIds}&from=mts`),
      getReviews(`turkopticon`, `https://turkopticon.ucsd.edu/api/multi-attrs.php?ids=${arrayIds}`),
      getReviews(`turkopticon2`, `https://api.turkopticon.info/requesters?rids=${arrayIds}&fields[requesters]=aggregates`)
    ])

    for (const item of getReviewsAll) {
      if (item && item.length > 0) {
        const site = item[0]
        const reviews = item[1]

        for (const key in reviews) {
          objectReviews[key][site] = reviews[key]
        }
      }
    }

    const time = new Date().getTime()
    const transaction = requesterReviewsDB.transaction([`requester`], `readwrite`)
    const objectStore = transaction.objectStore(`requester`)

    for (const key in objectReviews) {
      const obj = objectReviews[key]

      obj.id = key
      obj.time = time
      objectStore.put(obj)
    }

    resolve(objectReviews)
  })
}

function requesterRatingAverage () {
  const [requesterId] = arguments

  const review = reviewsDB[requesterId]

  if (review) {
    const tv = storage.reviews.turkerview ? review.turkerview : null
    const to = storage.reviews.turkopticon ? review.turkopticon : null
    const to2 = storage.reviews.turkopticon2 ? review.turkopticon2 : null

    const tvPay = tv ? tv.ratings.pay : null
    const tvHrly = tv ? (tv.ratings.hourly / 3) : null
    const toPay = to ? to.attrs.pay : null
    const to2Hrly = to2 ? to2.recent.reward[1] > 0 ? ((to2.recent.reward[0] / to2.recent.reward[1] * 3600) / 3) : to2.all.reward[1] > 0 ? ((to2.all.reward[0] / to2.all.reward[1] * 3600) / 3) : null : null

    if (tvPay || tvHrly || toPay || to2Hrly) {
      const average = [tvPay, tvHrly, toPay, to2Hrly].filter(Boolean).map((currentValue, index, array) => Number(currentValue) / array.length).reduce((a, b) => a + b)
      return average
    }
  }

  return 0
}

function requesterReviewGetClass () {
  const [requesterId] = arguments

  const average = requesterRatingAverage(requesterId)
  return (average > 3.75 ? `success` : average > 2 ? `warning` : average > 0 ? `danger` : `default`)
}

async function updateRequesterReviews (reviews) {
  for (const key in reviews) {
    reviewsDB[key] = reviews[key]

    const reviewClass = requesterReviewGetClass(key)

    if (reviewClass) {
      for (const element of document.getElementsByClassName(`btn-${key}`)) {
        element.classList.remove(`btn-success`, `btn-warning`, `btn-danger`)
        element.classList.add(`btn-${reviewClass}`)
      }
      for (const element of document.getElementsByClassName(`table-${key}`)) {
        element.classList.remove(`table-success`, `table-warning`, `table-danger`)
        if (storage.hitFinder[`display-colored-rows`]) {
          element.classList.add(`table-${reviewClass}`)
        }
      }
    }
  }
}

let hitTrackerDB = (() => {
  const open = window.indexedDB.open(`hitTrackerDB`, 1)

  open.onsuccess = (event) => {
    hitTrackerDB = event.target.result
  }
})()

function hitTrackerMatch () {
  const [name, value] = arguments

  let resolveValue

  return new Promise((resolve) => {
    const transaction = hitTrackerDB.transaction([`hit`], `readonly`)
    const objectStore = transaction.objectStore(`hit`)
    const myIndex = objectStore.index(name)
    const myIDBKeyRange = window.IDBKeyRange.only(value)

    myIndex.openCursor(myIDBKeyRange).onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        if (cursor.value.state.match(/Submitted|Approved|Rejected|Paid/)) {
          resolveValue = true
        } else {
          cursor.continue()
        }
      } else {
        resolveValue = false
      }
    }

    transaction.oncomplete = (event) => {
      resolve(resolveValue)
    }
  })
}

function hitTrackerMatchObject () {
  const [name, value] = arguments

  let resolveValue

  return new Promise(async (resolve) => {
    const match = await hitTrackerMatch(name, value)
    resolveValue = match ? { color: `success`, icon: `check` } : { color: `secondary`, icon: `minus` }
    resolve(resolveValue)
  })
}

function saveToFileJSON () {
  const [name, json] = arguments

  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  const year = today.getFullYear()
  const date = `${year}${month < 10 ? `0` : ``}${month}${day < 10 ? `0` : ``}${day}`

  const data = JSON.stringify(json)

  const exportFile = document.createElement(`a`)
  exportFile.href = window.URL.createObjectURL(new window.Blob([data], { type: `application/json` }))
  exportFile.download = `mts-backup-${date}-${name}.json`

  document.body.appendChild(exportFile)
  exportFile.click()
  document.body.removeChild(exportFile)
}

function loadFromFileJSON () {
  const [file] = arguments

  return new Promise((resolve) => {
    const reader = new window.FileReader()
    reader.readAsText(file)

    reader.onload = (event) => {
      const json = JSON.parse(event.target.result)
      resolve(json)
    }
  })
}

$(`[data-toggle="tooltip"]`).tooltip({
  delay: {
    show: 500
  }
})

$(`#block-list-add-modal`).on(`show.bs.modal`, (event) => {
  const name = event.relatedTarget.dataset.name
  const match = event.relatedTarget.dataset.match

  document.getElementById(`block-list-add-name`).value = name || ``
  document.getElementById(`block-list-add-match`).value = match || ``
  document.getElementById(`block-list-add-strict`).checked = true
})

$(`#block-list-edit-modal`).on(`show.bs.modal`, (event) => {
  const key = event.relatedTarget.dataset.key
  const item = storage.blockList[key]

  document.getElementById(`block-list-edit-name`).value = item.name
  document.getElementById(`block-list-edit-match`).value = item.match
  document.getElementById(`block-list-edit-strict`).checked = item.strict

  document.getElementById(`block-list-edit-delete`).dataset.key = key
})

$(`#include-list-add-modal`).on(`show.bs.modal`, (event) => {
  const name = event.relatedTarget.dataset.name
  const match = event.relatedTarget.dataset.match

  document.getElementById(`include-list-add-name`).value = name || ``
  document.getElementById(`include-list-add-match`).value = match || ``
  document.getElementById(`include-list-add-strict`).checked = true
  document.getElementById(`include-list-add-sound`).checked = true
  document.getElementById(`include-list-add-alarm`).checked = false
  document.getElementById(`include-list-add-notification`).checked = true
  document.getElementById(`include-list-add-pushbullet`).checked = false
})

$(`#include-list-edit-modal`).on(`show.bs.modal`, (event) => {
  const key = event.relatedTarget.dataset.key
  const item = storage.includeList[key]

  document.getElementById(`include-list-edit-name`).value = item.name
  document.getElementById(`include-list-edit-match`).value = item.match
  document.getElementById(`include-list-edit-strict`).checked = item.strict
  document.getElementById(`include-list-edit-sound`).checked = item.sound
  document.getElementById(`include-list-edit-alarm`).checked = item.alarm
  document.getElementById(`include-list-edit-notification`).checked = item.notification
  document.getElementById(`include-list-edit-pushbullet`).checked = item.pushbullet

  document.getElementById(`include-list-edit-delete`).dataset.key = key
})

$(`#settngs-modal`).on(`show.bs.modal`, (event) => {
  for (const prop in storage.hitFinder) {
    document.getElementById(prop)[typeof (storage.hitFinder[prop]) === `boolean` ? `checked` : `value`] = storage.hitFinder[prop]
  }
})

$(`#hit-info-modal`).on(`show.bs.modal`, (event) => {
  const key = event.relatedTarget.dataset.key
  const hit = finderDB[key]

  document.getElementById(`hit-info-title`).textContent = hit.title
  document.getElementById(`hit-info-requester`).textContent = `${hit.requester_name} [${hit.requester_id}]`
  document.getElementById(`hit-info-reward`).textContent = toMoneyString(hit.monetary_reward.amount_in_dollars)
  document.getElementById(`hit-info-duration`).textContent = toDurationString(hit.assignment_duration_in_seconds)
  document.getElementById(`hit-info-available`).textContent = hit.assignable_hits_count
  document.getElementById(`hit-info-description`).textContent = hit.description
  document.getElementById(`hit-info-requirements`).textContent = hit.project_requirements.map((o) => `${o.qualification_type.name} ${o.comparator} ${o.qualification_values.map(v => v).join(`, `)}`.trim()).join(`; `) || `None`

  document.getElementById(`hit-info-block-requester`).dataset.key = key
  document.getElementById(`hit-info-block-requester`).dataset.name = hit.requester_name
  document.getElementById(`hit-info-block-requester`).dataset.match = hit.requester_id

  document.getElementById(`hit-info-block-hit`).dataset.key = key
  document.getElementById(`hit-info-block-hit`).dataset.name = hit.title
  document.getElementById(`hit-info-block-hit`).dataset.match = hit.hit_set_id

  document.getElementById(`hit-info-include-requester`).dataset.key = key
  document.getElementById(`hit-info-include-requester`).dataset.name = hit.requester_name
  document.getElementById(`hit-info-include-requester`).dataset.match = hit.requester_id

  document.getElementById(`hit-info-include-hit`).dataset.key = key
  document.getElementById(`hit-info-include-hit`).dataset.name = hit.title
  document.getElementById(`hit-info-include-hit`).dataset.match = hit.hit_set_id
})

$(`#hit-sharer-modal`).on(`show.bs.modal`, (event) => {
  const key = event.relatedTarget.dataset.key

  for (const element of event.target.getElementsByClassName(`hit-sharer`)) {
    element.dataset.key = key
  }
})

$(`#requester-review-modal`).on(`show.bs.modal`, (event) => {
  const key = event.relatedTarget.dataset.key
  const review = reviewsDB[key]

  const tv = review.turkerview
  const to = review.turkopticon
  const to2 = review.turkopticon2

  if (storage.reviews.turkerview) {
    if (tv) {
      document.getElementById(`review-turkerview-link`).href = `https://turkerview.com/requesters/${key}`
      document.getElementById(`review-turkerview-ratings-hourly`).textContent = toMoneyString(tv.ratings.hourly)
      document.getElementById(`review-turkerview-ratings-pay`).textContent = tv.ratings.pay || `-`
      document.getElementById(`review-turkerview-ratings-fast`).textContent = tv.ratings.fast || `-`
      document.getElementById(`review-turkerview-ratings-comm`).textContent = tv.ratings.comm || `-`
      document.getElementById(`review-turkerview-rejections`).textContent = tv.rejections
      document.getElementById(`review-turkerview-tos`).textContent = tv.tos
      document.getElementById(`review-turkerview-blocks`).textContent = tv.blocks

      document.getElementById(`review-turkerview-review`).style.display = ``
      document.getElementById(`review-turkerview-no-reviews`).style.display = `none`
    } else {
      document.getElementById(`review-turkerview-review`).style.display = `none`
      document.getElementById(`review-turkerview-no-reviews`).style.display = ``
    }
    document.getElementById(`review-turkerview`).style.display = ``
  } else {
    document.getElementById(`review-turkerview`).style.display = `none`
  }

  if (storage.reviews.turkopticon) {
    if (to) {
      document.getElementById(`review-turkopticon-link`).href = `https://turkopticon.ucsd.edu/${key}`
      document.getElementById(`review-turkopticon-attrs-pay`).textContent = `${to.attrs.pay} / 5` || `- / 5`
      document.getElementById(`review-turkopticon-attrs-fast`).textContent = `${to.attrs.fast} / 5` || `- / 5`
      document.getElementById(`review-turkopticon-attrs-comm`).textContent = `${to.attrs.comm} / 5` || `- / 5`
      document.getElementById(`review-turkopticon-attrs-fair`).textContent = `${to.attrs.fair} / 5` || `- / 5`
      document.getElementById(`review-turkopticon-reviews`).textContent = to.reviews
      document.getElementById(`review-turkopticon-tos_flags`).textContent = to.tos_flags

      document.getElementById(`review-turkopticon-review`).style.display = ``
      document.getElementById(`review-turkopticon-no-reviews`).style.display = `none`
    } else {
      document.getElementById(`review-turkopticon-review`).style.display = `none`
      document.getElementById(`review-turkopticon-no-reviews`).style.display = ``
    }
    document.getElementById(`review-turkopticon`).style.display = ``
  } else {
    document.getElementById(`review-turkopticon`).style.display = `none`
  }

  if (storage.reviews.turkopticon2) {
    if (to2) {
      const recent = to2.recent
      const all = to2.all

      document.getElementById(`review-turkopticon2-link`).href = `https://turkopticon.info/requesters/${key}`
      document.getElementById(`review-turkopticon2-recent-reward`).textContent = recent.reward[1] > 0 ? `$${(recent.reward[0] / recent.reward[1] * 3600).toFixed(2)}` : `---`
      document.getElementById(`review-turkopticon2-recent-pending`).textContent = recent.pending > 0 ? `${(recent.pending / 86400).toFixed(2)} days` : `---`
      document.getElementById(`review-turkopticon2-recent-comm`).textContent = recent.comm[1] > 0 ? `${Math.round(recent.comm[0] / recent.comm[1] * 100)}% of ${recent.comm[1]}` : `---`
      document.getElementById(`review-turkopticon2-recent-recommend`).textContent = recent.recommend[1] > 0 ? `${Math.round(recent.recommend[0] / recent.recommend[1] * 100)}% of ${recent.recommend[1]}` : `---`
      document.getElementById(`review-turkopticon2-recent-rejected`).textContent = recent.rejected[0]
      document.getElementById(`review-turkopticon2-recent-tos`).textContent = recent.tos[0]
      document.getElementById(`review-turkopticon2-recent-broken`).textContent = recent.broken[0]

      document.getElementById(`review-turkopticon2-all-reward`).textContent = all.reward[1] > 0 ? `$${(all.reward[0] / all.reward[1] * 3600).toFixed(2)}` : `---`
      document.getElementById(`review-turkopticon2-all-pending`).textContent = all.pending > 0 ? `${(all.pending / 86400).toFixed(2)} days` : `---`
      document.getElementById(`review-turkopticon2-all-comm`).textContent = all.comm[1] > 0 ? `${Math.round(all.comm[0] / all.comm[1] * 100)}% of ${all.comm[1]}` : `---`
      document.getElementById(`review-turkopticon2-all-recommend`).textContent = all.recommend[1] > 0 ? `${Math.round(all.recommend[0] / all.recommend[1] * 100)}% of ${all.recommend[1]}` : `---`
      document.getElementById(`review-turkopticon2-all-rejected`).textContent = all.rejected[0]
      document.getElementById(`review-turkopticon2-all-tos`).textContent = all.tos[0]
      document.getElementById(`review-turkopticon2-all-broken`).textContent = all.broken[0]

      document.getElementById(`review-turkopticon2-review`).style.display = ``
      document.getElementById(`review-turkopticon2-no-reviews`).style.display = `none`
    } else {
      document.getElementById(`review-turkopticon2-review`).style.display = `none`
      document.getElementById(`review-turkopticon2-no-reviews`).style.display = ``
    }
  } else {
    document.getElementById(`review-turkopticon2`).style.display = `none`
  }
})

$(document).on(`close.bs.alert`, `#alarm-alert`, (event) => {
  if (alarmAudio) {
    alarmAudio.pause()
    alarmAudio.currentTime = 0
  }

  alarm = false
  alarmRunning = false
})

document.getElementById(`find`).addEventListener(`click`, finderToggle)

document.getElementById(`speed`).addEventListener(`change`, (event) => {
  storage.hitFinder.speed = event.target.value

  window.chrome.storage.local.set({
    finder: storage.hitFinder
  })
})

document.getElementById(`block-list-delete`).addEventListener(`click`, (event) => {
  const result = window.confirm(`Are you sure you delete your entire Block List?`)

  if (result) {
    storage.blockList = {}
    blockListUpdate()
  }
})

document.getElementById(`block-list-export`).addEventListener(`click`, (event) => {
  saveToFileJSON(`block-list`, storage.blockList)
})

document.getElementById(`block-list-import`).addEventListener(`change`, async (event) => {
  const json = await loadFromFileJSON(event.target.files[0])

  for (const key in json) {
    const item = json[key]

    if (item.name.length && item.match.length) {
      storage.blockList[key] = {
        name: item.name,
        match: item.match,
        strict: typeof (item.strict) === `boolean` ? item.strict : true
      }
    }
  }

  blockListUpdate()
})

document.getElementById(`block-list-add-save`).addEventListener(`click`, (event) => {
  const name = document.getElementById(`block-list-add-name`).value
  const match = document.getElementById(`block-list-add-match`).value

  if (name.length && match.length) {
    storage.blockList[match] = {
      name: name,
      match: match,
      strict: document.getElementById(`block-list-add-strict`).checked
    }

    blockListUpdate()
  }
})

document.getElementById(`block-list-edit-save`).addEventListener(`click`, (event) => {
  const name = document.getElementById(`block-list-edit-name`).value
  const match = document.getElementById(`block-list-edit-match`).value

  if (name.length && match.length) {
    storage.blockList[match] = {
      name: name,
      match: match,
      strict: document.getElementById(`block-list-edit-strict`).checked
    }

    blockListUpdate()
  }
})

document.getElementById(`block-list-edit-delete`).addEventListener(`click`, (event) => {
  const key = event.target.dataset.key
  delete storage.blockList[key]
  blockListUpdate()
})

document.getElementById(`include-list-delete`).addEventListener(`click`, (event) => {
  const result = window.confirm(`Are you sure you delete your entire Include List?`)

  if (result) {
    storage.includeList = {}
    includeListUpdate()
  }
})

document.getElementById(`include-list-import`).addEventListener(`change`, async (event) => {
  const json = await loadFromFileJSON(event.target.files[0])

  for (const key in json) {
    const item = json[key]

    if (item.name.length && item.match.length) {
      storage.includeList[key] = {
        name: item.name,
        match: item.match,
        strict: typeof (item.strict) === `boolean` ? item.strict : true,
        sound: typeof (item.sound) === `boolean` ? item.sound : true,
        alarm: typeof (item.alarm) === `boolean` ? item.alarm : false,
        pushbullet: typeof (item.pushbullet) === `boolean` ? item.pushbullet : false,
        notification: typeof (item.notification) === `boolean` ? item.notification : true
      }
    }
  }

  includeListUpdate()
})

document.getElementById(`include-list-export`).addEventListener(`click`, (event) => {
  saveToFileJSON(`include-list`, storage.includeList)
})

document.getElementById(`include-list-add-save`).addEventListener(`click`, (event) => {
  const name = document.getElementById(`include-list-add-name`).value
  const match = document.getElementById(`include-list-add-match`).value

  if (name.length && match.length) {
    storage.includeList[match] = {
      name: name,
      match: match,
      strict: document.getElementById(`include-list-add-strict`).checked,
      sound: document.getElementById(`include-list-add-sound`).checked,
      alarm: document.getElementById(`include-list-add-alarm`).checked,
      notification: document.getElementById(`include-list-add-notification`).checked,
      pushbullet: document.getElementById(`include-list-add-pushbullet`).checked
    }

    includeListUpdate()
  }
})

document.getElementById(`include-list-edit-save`).addEventListener(`click`, (event) => {
  const name = document.getElementById(`include-list-edit-name`).value
  const match = document.getElementById(`include-list-edit-match`).value

  if (name.length && match.length) {
    storage.includeList[match] = {
      name: name,
      match: match,
      strict: document.getElementById(`include-list-edit-strict`).checked,
      sound: document.getElementById(`include-list-edit-sound`).checked,
      alarm: document.getElementById(`include-list-edit-alarm`).checked,
      notification: document.getElementById(`include-list-edit-notification`).checked,
      pushbullet: document.getElementById(`include-list-edit-pushbullet`).checked
    }

    includeListUpdate()
  }
})

document.getElementById(`include-list-edit-delete`).addEventListener(`click`, (event) => {
  const key = event.target.dataset.key
  delete storage.includeList[key]
  includeListUpdate()
})

document.getElementById(`settings-apply`).addEventListener(`click`, finderApply)

document.getElementById(`alarm-on`).addEventListener(`click`, (event) => {
  if (!alarm) {
    alarm = true

    const alert = document.createElement(`div`)
    alert.id = `alarm-alert`
    alert.className = `alert alert-info alert-dismissible fade show`

    const message = document.createElement(`strong`)
    message.textContent = `Alarm is active!`
    alert.appendChild(message)

    const close = document.createElement(`button`)
    close.type = `button`
    close.className = `close`
    close.textContent = `×`
    close.dataset.dismiss = `alert`
    alert.appendChild(close)

    document.body.prepend(alert)
  }
})

document.getElementById(`include-hits-clear`).addEventListener(`click`, (event) => {
  document.getElementById(`include-list-hits-card`).style.display = `none`
  removeChildren(document.getElementById(`include-list-hits-tbody`))
})

document.getElementById(`recent-hits-toggle`).addEventListener(`click`, (event) => {
  const classList = document.getElementById(`recent-hits-toggle`).firstElementChild.classList
  classList.toggle(`fa-caret-up`)
  classList.toggle(`fa-caret-down`)

  const element = document.getElementById(`recent-hits-card`).getElementsByClassName(`card-block`)[0]
  element.style.display = element.style.display === `none` ? `` : `none`
})

document.getElementById(`logged-hits-toggle`).addEventListener(`click`, (event) => {
  const classList = document.getElementById(`logged-hits-toggle`).firstElementChild.classList
  classList.toggle(`fa-caret-up`)
  classList.toggle(`fa-caret-down`)

  const element = document.getElementById(`logged-hits-card`).getElementsByClassName(`card-block`)[0]
  element.style.display = element.style.display === `none` ? `` : `none`
})

document.getElementById(`hit-export-short`).addEventListener(`click`, (event) => {
  const key = event.target.dataset.key
  const hit = finderDB[key]

  window.chrome.runtime.sendMessage({
    function: `hitExportShort`,
    arguments: {
      hit: hit
    }
  })
})

document.getElementById(`hit-export-plain`).addEventListener(`click`, (event) => {
  const key = event.target.dataset.key
  const hit = finderDB[key]

  window.chrome.runtime.sendMessage({
    function: `hitExportPlain`,
    arguments: {
      hit: hit
    }
  })
})

document.getElementById(`hit-export-bbcode`).addEventListener(`click`, (event) => {
  const key = event.target.dataset.key
  const hit = finderDB[key]

  window.chrome.runtime.sendMessage({
    function: `hitExportBBCode`,
    arguments: {
      hit: hit
    }
  })
})

document.getElementById(`hit-export-markdown`).addEventListener(`click`, (event) => {
  const key = event.target.dataset.key
  const hit = finderDB[key]

  window.chrome.runtime.sendMessage({
    function: `hitExportMarkdown`,
    arguments: {
      hit: hit
    }
  })
})

document.getElementById(`hit-export-turkerhub`).addEventListener(`click`, (event) => {
  const result = window.confirm(`Are you sure you want to export this HIT to TurkerHub.com?`)

  if (result) {
    const key = event.target.dataset.key
    const hit = finderDB[key]

    window.chrome.runtime.sendMessage({
      function: `hitExportTurkerHub`,
      arguments: {
        hit: hit
      }
    })
  }
})

document.getElementById(`hit-export-mturkcrowd`).addEventListener(`click`, (event) => {
  const result = window.confirm(`Are you sure you want to export this HIT to MTurkCrowd.com?`)

  if (result) {
    const key = event.target.dataset.key
    const hit = finderDB[key]

    window.chrome.runtime.sendMessage({
      function: `hitExportMTurkCrowd`,
      arguments: {
        hit: hit
      }
    })
  }
})
