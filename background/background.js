// Create and display the update available notification.
function createUpdateAvailableNotification (details) {
  chrome.notifications.create(`onUpdateAvailable`, {
    type: `basic`,
    message: `Update v${details.version} is available! This update will be applied the next time your browser or MTurk Suite is restarted.`,
    title: `Update Available`,
    iconUrl: `/media/icon_128.png`,
    ...(window.chrome ? { buttons: [{ title: `Update Now` }] } : null),
    requireInteraction: true
  })

  addUpdateAvailableListeners()
}

// Adds listeners for the update available notification.
function addUpdateAvailableListeners () {
  if (!chrome.notifications.onClosed.hasListener(removeUpdateAvailableListeners)) {
    chrome.notifications.onClosed.addListener(removeUpdateAvailableListeners)
  }
  if (!chrome.notifications.onButtonClicked.hasListener(removeUpdateAvailableListeners)) {
    chrome.notifications.onButtonClicked.addListener(updateAvailableButtonClicked)
  }
}

// Removes all the listeners created for the update available notification.
function removeUpdateAvailableListeners (notificationId, byUser) {
  if (notificationId === `onUpdateAvailable`) {
    chrome.notifications.onClosed.removeListener(removeUpdateAvailableListeners)
    chrome.notifications.onButtonClicked.removeListener(updateAvailableButtonClicked)
  }
}

// Reloads the extension when the user clicks the update available notification button.
function updateAvailableButtonClicked (notificationId, buttonIndex) {
  if (notificationId === `onUpdateAvailable`) chrome.runtime.reload()
}

// Fired when an update is available.
chrome.runtime.onUpdateAvailable.addListener(createUpdateAvailableNotification)

//* ********* Omnibox **********//
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  chrome.omnibox.setDefaultSuggestion({
    description: 'Search Mechanical Turk for %s'
  })
})

chrome.omnibox.onInputEntered.addListener((text) => {
  chrome.tabs.getSelected(null, (tab) => {
    chrome.tabs.update(tab.id, {
      url: `https://worker.mturk.com/?filters%5Bsearch_term%5D=${encodeURIComponent(text)}`
    })
  })
})

// https://worker.mturk.com/projects/*/tasks/*/submit
// https://worker.mturk.com/projects/*/tasks/*/submit_qap

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const func = request.function

  if (func && window[func] instanceof Function && !~func.indexOf(`hitExport`)) {
    window[func](request.arguments, request, sender, sendResponse)
    return true
  }
})

//* ********* Web Requests **********//
let requestsDB = {}

chrome.webRequest.onBeforeRequest.addListener((details) => {
  const match = details.url.match(/https:\/\/worker.mturk.com\/projects\/([A-Z0-9]+)\/tasks/)

  if (match) {
    requestsDB[details.requestId] = {
      tabId: details.tabId,
      hit_set_id: match[1]
    }
  }
}, {
  urls: [`https://worker.mturk.com/projects/*/tasks*`], types: [`main_frame`]
}, [`requestBody`])

chrome.webRequest.onCompleted.addListener((details) => {
  const request = requestsDB[details.requestId]

  if (request) {
    const catcher = chrome.extension.getViews().map((o) => o.location.pathname).includes(`/hit_catcher/hit_catcher.html`)

    if (catcher && details.url.indexOf(`https://worker.mturk.com/projects/${request.hit_set_id}/tasks`) === -1) {
      setTimeout(() => {
        chrome.tabs.sendMessage(request.tabId, {
          hitMissed: request.hit_set_id
        })
      }, 250)
    }
  }
}, {
  urls: [`https://worker.mturk.com/*`], types: [`main_frame`]
}, [`responseHeaders`])

let filterParams = ``

chrome.webRequest.onCompleted.addListener((details) => {
  const url = new window.URL(details.url)

  if (!details.url.match(/format=json|\.json/)) {
    const params = new window.URLSearchParams(url.search)
    params.delete(`page_number`)
    params.delete(`filters[search_term]`)

    filterParams = params
  }
}, {
  urls: [`https://worker.mturk.com/?*`, `https://worker.mturk.com/projects*`], types: [`main_frame`]
}, [`responseHeaders`])

chrome.webRequest.onBeforeRequest.addListener((details) => {
  if (storage.scripts.rememberFilter) {
    return {
      redirectUrl: `${details.url}?${filterParams}`
    }
  }
}, {
  urls: [`https://worker.mturk.com/`, `https://worker.mturk.com/projects`], types: [`main_frame`]
}, [`blocking`])

//* ********* Requester Reviews **********//
let requesterReviewsDB;

(() => {
  const open = window.indexedDB.open(`requesterReviewsDB`, 1)

  open.onsuccess = (event) => {
    requesterReviewsDB = event.target.result
  }
  open.onupgradeneeded = (event) => {
    requesterReviewsDB = event.target.result

    requesterReviewsDB.createObjectStore(`requester`, { keyPath: `id` })
  }
})()

function requesterReviewsGet (args, request, sender, sendResponse) {
  const time = new Date().getTime()
  const reviews = {}
  const transaction = requesterReviewsDB.transaction([`requester`], `readonly`)
  const objectStore = transaction.objectStore(`requester`)

  let update = false

  for (let i = 0; i < args.requesters.length; i++) {
    const id = args.requesters[i]
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
      const updatedReviews = await requesterReviewsUpdate(reviews, args.requesters)
      sendResponse(updatedReviews)
    } else {
      sendResponse(reviews)
    }
  }
}

function requesterReviewsGetExport (id) {
  return new Promise((resolve) => {
    const transaction = requesterReviewsDB.transaction([`requester`], `readonly`)
    const objectStore = transaction.objectStore(`requester`)
    const request = objectStore.get(id)

    request.onsuccess = (event) => {
      resolve(event.target.result ? event.target.result : null)
    }
  })
}

function requesterReviewsUpdate (objectReviews, arrayIds) {
  return new Promise(async (resolve) => {
    const getReviews = (stringSite, stringURL) => {
      return new Promise(async (resolve) => {
        try {
          const response = await fetch(stringURL)

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

//* ********* Storage  **********//
const storage = {
  blockList () {
    const [object] = arguments, template = {}

    for (const key in object) {
      const prop = object[key]

      if (prop.match) {
        template[prop.match] = {
          'name': prop.name || prop.match,
          'match': prop.match,
          'strict': typeof (prop.strict) === `boolean` ? prop.strict : true
        }
      }
    }

    storage.blockList = template
  },

  includeList () {
    const [object] = arguments, template = {}

    for (const key in object) {
      const prop = object[key]

      if (prop.match) {
        template[prop.match] = {
          'name': prop.name || prop.match,
          'match': prop.match,
          'strict': typeof (prop.strict) === `boolean` ? prop.strict : true,
          'sound': typeof (prop.sound) === `boolean` ? prop.sound : true,
          'alarm': typeof (prop.alarm) === `boolean` ? prop.alarm : false,
          'pushbullet': typeof (prop.pushbullet) === `boolean` ? prop.pushbullet : false,
          'notification': typeof (prop.notification) === `boolean` ? prop.notification : true
        }
      }
    }

    storage.includeList = template
  },

  exports () {
    const [string] = arguments, template = `all`

    storage.exports = [`all`, `short`, `plain`, `bbcode`, `markdown`, `turkerhub`, `mturkcrowd`].includes(string) ? string : template
  },

  hitFinder () {
    const [object] = arguments, template = {
        'speed': `3000`,

        'filter-search-term': ``,
        'filter-sort': `updated_desc`,
        'filter-page-size': `25`,
        'filter-masters': false,
        'filter-qualified': false,
        'filter-min-reward': `0`,
        'filter-min-available': `0`,
        'filter-min-requester-rating': `0`,

        'alert-new-sound': `sound-1`,
        'alert-include-delay': `30`,
        'alert-include-sound': `voice`,
        'alert-pushbullet-state': `off`,
        'alert-pushbullet-token': ``,

        'display-colored-rows': true,

        'display-recent-column-time': false,
        'display-recent-column-requester': true,
        'display-recent-column-title': true,
        'display-recent-column-available': true,
        'display-recent-column-reward': true,
        'display-recent-column-masters': true,

        'display-logged-column-time': true,
        'display-logged-column-requester': true,
        'display-logged-column-title': true,
        'display-logged-column-available': true,
        'display-logged-column-reward': true,
        'display-logged-column-masters': true,

        'display-included-column-time': true,
        'display-included-column-requester': true,
        'display-included-column-title': true,
        'display-included-column-available': true,
        'display-included-column-reward': true,
        'display-included-column-masters': true
      }

    for (const prop in template) {
      if (object !== undefined && object[prop] !== undefined && typeof (object[prop]) === typeof (template[prop])) {
        template[prop] = object[prop]
      }
    }

    storage.hitFinder = template
  },

  reviews () {
    const [object] = arguments, template = {
        'turkerview': true,
        'turkopticon': true,
        'turkopticon2': true
      }

    for (const prop in template) {
      if (object !== undefined && object[prop] !== undefined && typeof (object[prop]) === typeof (template[prop])) {
        template[prop] = object[prop]
      }
    }

    storage.reviews = template
  },

  scripts () {
    const [object] = arguments, template = {
        autoAcceptChecker: true,
        blockListOnMturk: true,
        confirmReturnHIT: true,
        dashboardEnhancer: true,
        hitExporter: true,
        hitTracker: true,
        hitDetailsSticky: true,
        paginationLastPage: true,
        queueInfoEnhancer: true,
        rateLimitReloader: true,
        rememberFilter: true,
        requesterReviews: true,
        workspaceExpander: true
      }

    for (const prop in template) {
      if (object !== undefined && object[prop] !== undefined && typeof (object[prop]) === typeof (template[prop])) {
        template[prop] = object[prop]
      }
    }

    storage.scripts = template
  },

  themes () {
    const [object] = arguments, template = {
        mts: `default`,
        mturk: `default`
      }

    for (const prop in template) {
      if (object !== undefined && object[prop] !== undefined && typeof (object[prop]) === typeof (template[prop])) {
        template[prop] = object[prop]
      }
    }

    storage.themes = template
  },

  version () {
    const [string] = arguments, template = chrome.runtime.getManifest().version

    if (string !== template) {
      chrome.tabs.create({
        url: `/change_log/change_log.html`
      })
    }

    storage.version = template
  },

  workerId () {
    const [string] = arguments, template = `A-------------`

    storage.workerId = string || template
  }
}

chrome.storage.local.get(null, (keys) => {
  for (const prop in keys) {
    if (storage[prop] && typeof (storage[prop]) === `function`) {
      storage[prop](keys[prop])
    }
  }

  for (const prop in storage) {
    if (typeof (storage[prop]) === `function`) {
      storage[prop]()
    }

    chrome.storage.local.set({
      [prop]: storage[prop]
    })
  }
})

chrome.storage.onChanged.addListener((changes) => {
  for (const value of [`reviews`, `scripts`, `workerId`]) {
    if (changes[value] !== undefined) {
      storage[value] = changes[value].newValue
    }
  }
})

//* ********* HIT Tracker **********//
let hitTrackerDB;

(() => {
  const open = window.indexedDB.open(`hitTrackerDB`, 1)

  open.onsuccess = (event) => {
    hitTrackerDB = event.target.result
    hitTrackerGetProjected()
  }
  open.onupgradeneeded = (event) => {
    hitTrackerDB = event.target.result

    const hitObjectStore = hitTrackerDB.createObjectStore(`hit`, {
      keyPath: `hit_id`
    })

    for (const value of [`requester_id`, `requester_name`, `state`, `title`, `date`]) {
      hitObjectStore.createIndex(value, value, {
        unique: false
      })
    }

    const dayObjectStore = hitTrackerDB.createObjectStore(`day`, {
      keyPath: `date`
    })

    for (const value of [`assigned`, `returned`, `abandoned`, `submitted`, `approved`, `rejected`, `pending`, `earnings`]) {
      dayObjectStore.createIndex(value, value, {
        unique: false
      })
    }
  }
})()

const accepted = new Object()

function hitTrackerUpdate (args) {
  const hit = args.hit
  const assignment_id = args.assignment_id

  accepted[assignment_id] = hit.hit_id

  const objectStore = hitTrackerDB.transaction([`hit`], `readwrite`).objectStore(`hit`)
  objectStore.put(hit)
}

function hitTrackerSubmitted (args) {
  const data = args.data
  const hitId = accepted[data.assignmentId]

  if (typeof hitId === `string`) {
    const transaction = hitTrackerDB.transaction([`hit`], `readwrite`)
    const objectStore = transaction.objectStore(`hit`)
    const request = objectStore.get(hitId)

    request.onerror = (event) => {}
    request.onsuccess = (event) => {
      const result = event.target.result

      result.answer = data.answer
      result.state = `Submitted`

      objectStore.put(result)
    }

    transaction.oncomplete = (event) => {
      hitTrackerGetProjected()
    }
  }
}

function hitTrackerGetProjected () {
  let projected = 0

  const transaction = hitTrackerDB.transaction([`hit`], `readonly`)
  const objectStore = transaction.objectStore(`hit`)
  const index = objectStore.index(`date`)
  const range = IDBKeyRange.only(mturkDate())

  index.openCursor(range).onsuccess = (event) => {
    const cursor = event.target.result

    if (cursor) {
      const hit = cursor.value

      if (hit.state.match(/Submitted|Pending|Approved|Paid/)) {
        projected += hit.reward.amount_in_dollars
      }

      cursor.continue()
    }
  }

  transaction.oncomplete = (event) => {
    chrome.storage.local.set({
      earnings: projected
    })
  }
}

function hitTrackerGetCounts (args, request, sender, sendResponse) {
  const transaction = hitTrackerDB.transaction([`hit`], `readonly`)
  const objectStore = transaction.objectStore(`hit`)
  const requesterIndex = objectStore.index(`requester_id`)
  const titleIndex = objectStore.index(`title`)

  const counts = {}

  for (const item of args.requester_id) {
    counts[item] = {}

    const range = IDBKeyRange.only(item)

    requesterIndex.openCursor(range).onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        const value = cursor.value
        const state = value.state
        const count = counts[item][state]
        counts[item][state] = count ? count + 1 : 1
        cursor.continue()
      }
    }
  }

  for (const item of args.title) {
    counts[item] = {}

    const range = IDBKeyRange.only(item)

    titleIndex.openCursor(range).onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        const value = cursor.value
        const state = value.state
        const count = counts[item][state]
        counts[item][state] = count ? count + 1 : 1
        cursor.continue()
      }
    }
  }

  transaction.oncomplete = (event) => {
    sendResponse(counts)
  }
}

function openTracker () {
  chrome.tabs.create({ url: chrome.runtime.getURL(`hit_tracker/hit_tracker.html`) })
}

function mturkDate () {
  function dst () {
    const today = new Date()
    const year = today.getFullYear()
    let start = new Date(`March 14, ${year} 02:00:00`)
    let end = new Date(`November 07, ${year} 02:00:00`)
    let day = start.getDay()
    start.setDate(14 - day)
    day = end.getDay()
    end.setDate(7 - day)
    return !!((today >= start && today < end))
  }

  const given = new Date()
  const utc = given.getTime() + (given.getTimezoneOffset() * 60000)
  const offset = dst() === true ? `-7` : `-8`
  const amz = new Date(utc + (3600000 * offset))
  const day = (amz.getDate()) < 10 ? `0` + (amz.getDate()).toString() : (amz.getDate()).toString()
  const month = (amz.getMonth() + 1) < 10 ? `0` + (amz.getMonth() + 1).toString() : ((amz.getMonth() + 1)).toString()
  const year = (amz.getFullYear()).toString()
  return year + month + day
}

Object.assign(String.prototype, {
  num () {
    return Number(this.replace(/[^0-9.]/g, ``))
  },
  sanitize () {
    return this.replace(/</g, `&lt;`).replace(/>/g, `&gt;`)
  },
  toCamelCase () {
    return this.replace(/\W+(.)/g, (match, character) => character.toUpperCase())
  }
})

Object.assign(Number.prototype, {
  toMoneyString () {
    return `$${this.toFixed(2).toLocaleString(`en-US`, { minimumFractionDigits: 2 })}`
  },
  toTimeString () {
    let day, hour, minute, seconds = this
    minute = Math.floor(seconds / 60)
    seconds = seconds % 60
    hour = Math.floor(minute / 60)
    minute = minute % 60
    day = Math.floor(hour / 24)
    hour = hour % 24

    let string = ``

    if (day > 0) {
      string += `${day} day${day > 1 ? `s` : ``} `
    }
    if (hour > 0) {
      string += `${hour} hour${hour > 1 ? `s` : ``} `
    }
    if (minute > 0) {
      string += `${minute} minute${minute > 1 ? `s` : ``}`
    }
    return string.trim()
  }
})
