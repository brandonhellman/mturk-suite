/* globals chrome */

let hitTrackerDB = (() => {
  const open = window.indexedDB.open(`hitTrackerDB`, 1)

  open.onsuccess = (event) => {
    hitTrackerDB = event.target.result
    todaysOverview()
    trackerOverview()
  }
})()

async function todaysOverview () {
  const data = await todaysOverviewData()
  todaysOverviewDisplay(data)
}

function todaysOverviewData () {
  const promiseData = {
    hits: {
      assigned: { count: 0, value: 0 },
      submitted: { count: 0, value: 0 },
      approved: { count: 0, value: 0 },
      rejected: { count: 0, value: 0 },
      pending: { count: 0, value: 0 },
      returned: { count: 0, value: 0 }
    },
    requesters: {}
  }

  const hits = promiseData.hits
  const reqs = promiseData.requesters

  return new Promise((resolve) => {
    const transaction = hitTrackerDB.transaction([`hit`], `readonly`)
    const objectStore = transaction.objectStore(`hit`)
    const range = window.IDBKeyRange.only(mturkDate())

    objectStore.index(`date`).openCursor(range).onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        const hit = cursor.value
        const state = hit.state
        const reward = hit.reward.amount_in_dollars
        const requesterId = hit.requester_id

        if (state.match(/Submitted|Pending|Approved|Paid/)) {
          hits.submitted.count ++
          hits.submitted.value += reward

          if (state.match(/Approved|Paid/)) {
            hits.approved.count ++
            hits.approved.value += reward
          } else if (state.match(/Submitted|Pending/)) {
            hits.pending.count ++
            hits.pending.value += reward
          }

          if (!reqs[requesterId]) {
            reqs[requesterId] = {
              id: requesterId,
              name: hit.requester_name,
              count: 1,
              value: reward
            }
          } else {
            reqs[requesterId].count ++
            reqs[requesterId].value += reward
          }
        } else if (state.match(/Returned/)) {
          hits.returned.count ++
          hits.returned.value += reward
        } else if (state.match(/Rejected/)) {
          hits.rejected.count ++
          hits.rejected.value += reward
        }

        hits.assigned.count ++
        hits.assigned.value += reward
        cursor.continue()
      }
    }

    transaction.oncomplete = (event) => {
      resolve(promiseData)
    }
  })
}

function todaysOverviewDisplay () {
  const [data] = arguments

  const hits = data.hits
  const reqs = data.requesters

  document.getElementById(`assigned-count`).textContent = hits.assigned.count
  document.getElementById(`assigned-value`).textContent = toMoneyString(hits.assigned.value)

  document.getElementById(`submitted-count`).textContent = hits.submitted.count
  document.getElementById(`submitted-value`).textContent = toMoneyString(hits.submitted.value)

  document.getElementById(`approved-count`).textContent = hits.approved.count
  document.getElementById(`approved-value`).textContent = toMoneyString(hits.approved.value)

  document.getElementById(`rejected-count`).textContent = hits.rejected.count
  document.getElementById(`rejected-value`).textContent = toMoneyString(hits.rejected.value)

  document.getElementById(`pending-count`).textContent = hits.pending.count
  document.getElementById(`pending-value`).textContent = toMoneyString(hits.pending.value)

  document.getElementById(`returned-count`).textContent = hits.returned.count
  document.getElementById(`returned-value`).textContent = toMoneyString(hits.returned.value)

  const requesterTbody = document.getElementById(`requester-tbody`)

  while (requesterTbody.firstChild) {
    requesterTbody.removeChild(requesterTbody.firstChild)
  }

  const sorted = Object.keys(reqs).sort((a, b) => reqs[a].value - reqs[b].value)

  for (let i = sorted.length - 1; i > -1; i--) {
    const req = reqs[sorted[i]]

    const row = document.createElement(`tr`)

    const requester = document.createElement(`td`)
    row.append(requester)

    const requesterLink = document.createElement(`a`)
    requesterLink.href = `https://worker.mturk.com/requesters/${req.id}/projects`
    requesterLink.target = `_blank`
    requesterLink.textContent = req.name
    requester.appendChild(requesterLink)

    const count = document.createElement(`td`)
    count.textContent = req.count
    row.appendChild(count)

    const value = document.createElement(`td`)
    value.textContent = toMoneyString(req.value)
    row.appendChild(value)

    requesterTbody.appendChild(row)
  }

  document.getElementById(`tracker-projected-today-count`).textContent = hits.submitted.count
  document.getElementById(`tracker-projected-today-value`).textContent = toMoneyString(hits.submitted.value)
}

async function trackerOverview () {
  const data = await trackerOverviewData()
  trackerOverviewDisplay(data)
}

function trackerOverviewData () {
  const promiseData = {
    week: { count: 0, value: 0 },
    month: { count: 0, value: 0 },
    pending: { count: 0, value: 0 },
    approved: { count: 0, value: 0 }
  }

  return new Promise((resolve) => {
    const transaction = hitTrackerDB.transaction([`hit`], `readonly`)
    const objectStore = transaction.objectStore(`hit`)
    const week = getWeek()
    const month = getMonth()

    // pending week
    objectStore.index(`date`).openCursor(window.IDBKeyRange.bound(week.start, week.end)).onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        if (cursor.value.state.match(/Submitted|Pending|Approved|Paid/)) {
          promiseData.week.count ++
          promiseData.week.value += cursor.value.reward.amount_in_dollars
        }
        cursor.continue()
      }
    }

    // pending month
    objectStore.index(`date`).openCursor(window.IDBKeyRange.bound(month.start, month.end)).onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        if (cursor.value.state.match(/Submitted|Pending|Approved|Paid/)) {
          promiseData.month.count ++
          promiseData.month.value += cursor.value.reward.amount_in_dollars
        }
        cursor.continue()
      }
    }

    // submitted pending approval or rejection
    objectStore.index(`state`).openCursor(window.IDBKeyRange.only(`Submitted`)).onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        promiseData.pending.count ++
        promiseData.pending.value += cursor.value.reward.amount_in_dollars
        cursor.continue()
      }
    }

    // approved waiting payment
    objectStore.index(`state`).openCursor(window.IDBKeyRange.only(`Approved`)).onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        promiseData.approved.count ++
        promiseData.approved.value += cursor.value.reward.amount_in_dollars
        cursor.continue()
      }
    }

    transaction.oncomplete = (event) => {
      resolve(promiseData)
    }
  })
}

function trackerOverviewDisplay () {
  const [data] = arguments

  document.getElementById(`tracker-projected-week-count`).textContent = data.week.count
  document.getElementById(`tracker-projected-week-value`).textContent = toMoneyString(data.week.value)

  document.getElementById(`tracker-projected-month-count`).textContent = data.month.count
  document.getElementById(`tracker-projected-month-value`).textContent = toMoneyString(data.month.value)

  document.getElementById(`tracker-pending-count`).textContent = data.pending.count
  document.getElementById(`tracker-pending-value`).textContent = toMoneyString(data.pending.value)

  document.getElementById(`tracker-approved-count`).textContent = data.approved.count
  document.getElementById(`tracker-approved-value`).textContent = toMoneyString(data.approved.value)
}

// refactor needed
function syncDay (date) {
  return new Promise(async (resolve) => {
    syncingStarted()

    const dash = await fetchDashboard()
    const days = dash.daily_hit_statistics_overview.reduce((acc, cV) => { acc[cV.date.substring(0, 10).replace(/-/g, ``)] = cV; return acc }, {})

    await updateDashboard(days)

    await sync(date)
    await saveDay(date)

    sycningEnded()
    resolve()
  })
}

function syncLast45 () {
  return new Promise(async (resolve) => {
    syncingStarted()

    const dash = await fetchDashboard()
    const days = dash.daily_hit_statistics_overview.reduce((acc, cV) => { acc[cV.date.substring(0, 10).replace(/-/g, ``)] = cV; return acc }, {})

    await updateDashboard(days)
    const daysToUpdate = await checkDays(days)

    for (const date of daysToUpdate) {
      await sync(date)
      await saveDay(date)
    }

    sycningEnded()
    resolve()
  })
}

function fetchQueue (date) {
  syncingUpdated(date, `fetching queue`)

  return new Promise((resolve) => {
    (async function fetchLoop () {
      try {
        const response = await fetch(`https://worker.mturk.com/tasks?format=json`, {
          credentials: `include`
        })

        if (response.ok && response.url === `https://worker.mturk.com/tasks?format=json`) {
          const json = await response.json()
          resolve(json)
        } else if (response.url.indexOf(`https://worker.mturk.com/`) === -1) {
                    // we are logged out here
        } else {
          setTimeout(fetchLoop, 2000)
        }
      } catch (error) {
        setTimeout(fetchLoop, 2000)
      }
    })()
  })
}

function fetchDashboard (date) {
  syncingUpdated(date, `fetching dashboard`)

  return new Promise(async (resolve) => {
    (async function fetchLoop () {
      try {
        const response = await fetch(`https://worker.mturk.com/dashboard?format=json`, {
          credentials: `include`
        })

        if (response.ok && response.url === `https://worker.mturk.com/dashboard?format=json`) {
          const json = await response.json()
          resolve(json)
        } else if (response.url.indexOf(`https://worker.mturk.com/`) === -1) {
          return loggedOut()
        } else {
          setTimeout(fetchLoop, 2000)
        }
      } catch (error) {
        setTimeout(fetchLoop, 2000)
      }
    })()
  })
}

function updateDashboard (days) {
  return new Promise((resolve) => {
    const transaction = hitTrackerDB.transaction([`day`], `readwrite`)
    const objectStore = transaction.objectStore(`day`)

    for (const day in days) {
      const request = objectStore.get(day)

      request.onsuccess = (event) => {
        const result = event.target.result || {
          date: day,
          assigned: 0,
          returned: 0,
          abandoned: 0,
          submitted: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          paid: 0,
          earnings: 0
        }

        result.day = days[day]
        objectStore.put(result)
      }
    }

    transaction.oncomplete = (event) => {
      resolve()
    }
  })
}

function checkDays (days) {
  syncingUpdated(null, `checking last 45 days`)

  const daysArray = Object.keys(days).sort()

  return new Promise((resolve) => {
    const transaction = hitTrackerDB.transaction([`day`], `readwrite`)
    const objectStore = transaction.objectStore(`day`)
    const bound = IDBKeyRange.bound(daysArray[0], daysArray[daysArray.length - 1])

    objectStore.openCursor(bound).onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        const value = cursor.value
        const now = value.day

        const pending = now.pending === value.submitted
        const approved = now.approved === value.paid
        const rejected = now.rejected === value.rejected
        const submitted = now.submitted === value.submitted + value.approved + value.rejected + value.paid

        if (approved && pending && rejected && submitted) {
          const i = daysArray.indexOf(value.date)

          if (i !== -1) {
            const spliced = daysArray.splice(i, 1)
            saveDay(spliced[0])
          }
        }

        cursor.continue()
      }
    }

    transaction.oncomplete = (event) => {
      resolve(daysArray)
    }
  })
}

function saveDay (date) {
  return new Promise(async (resolve) => {
    const count = await countDay(date)

    const transaction = hitTrackerDB.transaction([`day`], `readwrite`)
    const objectStore = transaction.objectStore(`day`)

    const request = objectStore.get(date)

    request.onsuccess = (event) => {
      const result = event.target.result

      if (result) {
        count.day = result.day
      }

      objectStore.put(count)
    }

    transaction.oncomplete = (event) => {
      resolve()
    }
  })
}

function countDay (date) {
  return new Promise((resolve) => {
    const object = {
      date: date,

      assigned: 0,
      returned: 0,
      abandoned: 0,

      paid: 0,
      approved: 0,
      rejected: 0,
      submitted: 0,

      earnings: 0
    }

    const transaction = hitTrackerDB.transaction([`hit`], `readonly`)
    const objectStore = transaction.objectStore(`hit`)
    const index = objectStore.index(`date`)
    const only = IDBKeyRange.only(date)

    index.openCursor(only).onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        const state = cursor.value.state.toLowerCase()

        object[state] ++

        if (state.match(/paid/)) {
          object.earnings += cursor.value.reward.amount_in_dollars
        }
        cursor.continue()
      }
    }

    transaction.oncomplete = (event) => {
      object.earnings = Number(object.earnings.toFixed(2))
      resolve(object)
    }
  })
}

function syncPrepareDay (date) {
  syncingUpdated(date, `preparing sync`)

  return new Promise(async (resolve) => {
    const queue = await fetchQueue()
    const hit_ids = queue.tasks.map((o) => o.task_id)

    const transaction = hitTrackerDB.transaction([`hit`], `readwrite`)
    const objectStore = transaction.objectStore(`hit`)
    const index = objectStore.index(`date`)
    const only = IDBKeyRange.only(date)

    index.openCursor(only).onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        if (cursor.value.state.match(/Accepted|Submitted/) || (cursor.value.state === `Assigned` && !hit_ids.includes(cursor.value.hit_id))) {
          cursor.value.state = `Abandoned`
          cursor.update(cursor.value)
        }
        cursor.continue()
      }
    }

    transaction.oncomplete = (event) => {
      resolve()
    }
  })
}

function sync (date) {
  return new Promise(async (resolve, reject) => {
    await syncPrepareDay(date)

    const fetchDate = [date.slice(0, 4), date.slice(4, 6), date.slice(6, 8)].join(`-`);

    (async function fetchLoop (page) {
      const url = `https://worker.mturk.com/status_details/${fetchDate}?page_number=${page}&format=json`
      const response = await fetch(url, {
        credentials: `include`
      })

      if (response.ok && response.url === url) {
        const json = await response.json()

        if (json.num_results > 0) {
          syncingUpdated(date, `Updating page ${page} of ${Math.ceil(json.total_num_results / 20)} for ${json.total_num_results} HITs`)

          const transaction = hitTrackerDB.transaction([`hit`], `readwrite`)
          const objectStore = transaction.objectStore(`hit`)

          for (const hit of json.results) {
            const request = objectStore.get(hit.hit_id)

            request.onsuccess = (event) => {
              const result = event.target.result

              if (result) {
                for (const prop in result) {
                  if (prop !== `state`) {
                    hit[prop] = result[prop] ? result[prop] : hit[prop]
                  }
                }
              }

              if (hit.state === `Approved` && hit.reward.amount_in_dollars == 0) {
                hit.state = `Paid`
              }

              hit.date = date
              objectStore.put(hit)
            }
          }

          transaction.oncomplete = (e) => {
            return fetchLoop(++page)
          }
        } else {
          resolve()
        }
      } else if (response.url.indexOf(`https://worker.mturk.com/`) === -1) {
        throw `You are logged out!`
      } else {
        return setTimeout(fetchLoop, 2000, page)
      }
    })(1)
  })
}

function syncingStarted () {
  updating = true

  $(document.getElementById(`sync-modal`)).modal({
    backdrop: `static`,
    keyboard: false
  })
}

function syncingUpdated (date, message) {
  document.getElementById(`sync-date`).textContent = date ? [date.slice(0, 4), date.slice(4, 6), date.slice(6, 8)].join(`-`) : null
  document.getElementById(`sync-message`).textContent = message || null
}

function sycningEnded () {
  updating = false
  $(document.getElementById(`sync-modal`)).modal(`hide`)
}

function loggedOut () {
  textToSpeech(`Attention, you are logged out of MTurk.`)
  sycningEnded()
}

function getWeek () {
  const today = mturkDateString()
  const start = today.getDate() - today.getDay()
  const end = start + 6
  const startDate = new Date(today.setDate(start)).toISOString().slice(0, 10).replace(/-/g, ``)
  const endDate = new Date(today.setDate(today.getDate() + 6)).toISOString().slice(0, 10).replace(/-/g, ``)

  const tempDate = mturkDate()

  return { start: `20180311`, end: `20180317` }
}

function getMonth () {
  const today = mturkDateString()
  const month = (today.getMonth() + 1) < 10 ? `0` + (today.getMonth() + 1).toString() : ((today.getMonth() + 1)).toString()
  const year = (today.getFullYear()).toString()
  const date = new Date(today)

  return {
    start: year + month + `01`,
    end: mturkDate()
  }
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

function mturkDateString () {
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
  return amz
}

document.getElementById(`sync-today`).addEventListener(`click`, async (e) => {
  await syncDay(mturkDate())

  todaysOverview()
  trackerOverview()

  chrome.runtime.sendMessage({
    function: `hitTrackerGetProjected`
  })
})

document.getElementById(`sync-last-45-days`).addEventListener(`click`, async (e) => {
  await syncLast45()

  todaysOverview()
  trackerOverview()

  chrome.runtime.sendMessage({
    function: `hitTrackerGetProjected`
  })
})

document.getElementById(`requester-overview`).addEventListener(`click`, requesterOverview)
document.getElementById(`daily-overview`).addEventListener(`click`, dailyOverview)
document.getElementById(`search`).addEventListener(`click`, search)

async function requesterOverview () {
  statusStart({
    header: `Requester Overview`,
    message: `Starting`
  })

  const results = document.getElementById(`history-results`)
  const dateTo = document.getElementById(`date-to`).value
  const dateFrom = document.getElementById(`date-from`).value

  const transaction = hitTrackerDB.transaction([`hit`], `readonly`)
  const objectStore = transaction.objectStore(`hit`)
  const range = IDBKeyRange.bound(dateFrom.replace(/-/g, ``) || `0`, dateTo.replace(/-/g, ``) || `99999999`)

  let cursorCount = 0, cursorAccumulator = {}

  objectStore.index(`date`).openCursor(range).onsuccess = (event) => {
    const cursor = event.target.result

    if (cursor) {
      statusUpdate({ message: `Processing HIT ${++cursorCount}` })

      const hit = cursor.value
      const requester_id = hit.requester_id

      if (hit.state.match(/Submitted|Pending|Approved|Paid/)) {
        if (cursorAccumulator[requester_id]) {
          cursorAccumulator[requester_id].count += 1
          cursorAccumulator[requester_id].value += hit.reward.amount_in_dollars
        } else {
          cursorAccumulator[requester_id] = {
            id: requester_id,
            name: hit.requester_name,
            count: 1,
            value: hit.reward.amount_in_dollars
          }
        }
      }

      return cursor.continue()
    } else {
      while (results.firstChild) {
        results.removeChild(results.firstChild)
      }

      const sorted = Object.keys(cursorAccumulator).sort((a, b) => cursorAccumulator[a].value - cursorAccumulator[b].value)

      for (let i = sorted.length - 1; i > -1; i--) {
        const req = cursorAccumulator[sorted[i]]

        const tr = document.createElement(`tr`)

        const requester = document.createElement(`td`)
        tr.append(requester)

        const requesterView = document.createElement(`button`)
        requesterView.className = `btn btn-sm btn-primary mr-1`
        requesterView.textContent = `View`
        requesterView.addEventListener(`click`, async (event) => {
          document.getElementById(`view`).value = ``
          document.getElementById(`matching`).value = req.id
          document.getElementById(`date-from`).value = ``
          document.getElementById(`date-to`).value = ``
          search()
        })
        requester.appendChild(requesterView)

        const requesterLink = document.createElement(`a`)
        requesterLink.href = `https://worker.mturk.com/requesters/${req.id}/projects`
        requesterLink.target = `_blank`
        requesterLink.textContent = req.name
        requester.appendChild(requesterLink)

        const count = document.createElement(`td`)
        count.textContent = req.count
        tr.appendChild(count)

        const value = document.createElement(`td`)
        value.textContent = toMoneyString(req.value)
        tr.appendChild(value)

        results.appendChild(tr)
      }
    }
  }

  transaction.oncomplete = (event) => {
    const tr = document.createElement(`tr`)
    tr.className = `bg-primary text-white`

    const requester = document.createElement(`td`)
    requester.textContent = `Requester`
    tr.append(requester)

    const count = document.createElement(`td`)
    count.textContent = `HITs`
    tr.appendChild(count)

    const value = document.createElement(`td`)
    value.textContent = `Reward`
    tr.appendChild(value)

    results.prepend(tr)

    return statusEnd()
  }
}

async function dailyOverview () {
  searchStart()

  const results = document.getElementById(`history-results`)
  const dateTo = document.getElementById(`date-to`).value
  const dateFrom = document.getElementById(`date-from`).value

  const transaction = hitTrackerDB.transaction([`day`], `readonly`)
  const objectStore = transaction.objectStore(`day`)

  if (dateTo || dateFrom) {
    const days = []

    objectStore.openCursor(IDBKeyRange.bound(dateFrom.replace(/-/g, ``) || `0`, dateTo.replace(/-/g, ``) || `99999999`)).onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        days.push(cursor.value)
        return cursor.continue()
      } else {
        return process(days)
      }
    }
  } else {
    objectStore.getAll().onsuccess = (event) => {
      const hits = event.target.result
      return process(event.target.result)
    }
  }

  transaction.oncomplete = (event) => {
    const th = document.createElement(`tr`)
    th.className = `bg-primary text-white`

    const date = document.createElement(`td`)
    date.textContent = `Date`
    th.appendChild(date)

    const submitted = document.createElement(`td`)
    submitted.textContent = `Submitted`
    th.appendChild(submitted)

    const approved = document.createElement(`td`)
    approved.textContent = `Approved`
    th.appendChild(approved)

    const rejected = document.createElement(`td`)
    rejected.textContent = `Rejected`
    th.appendChild(rejected)

    const pending = document.createElement(`td`)
    pending.textContent = `Pending`
    th.appendChild(pending)

    const ret_aban = document.createElement(`td`)
    ret_aban.textContent = `Returned/Abandoned`
    th.appendChild(ret_aban)

    const earningsHits = document.createElement(`td`)
    earningsHits.textContent = `Earnings HITs`
    th.appendChild(earningsHits)

    results.prepend(th)

    return searchEnd()
  }

  function process (days) {
    while (results.firstChild) {
      results.removeChild(results.firstChild)
    }

    for (const day of days) {
      const tr = document.createElement(`tr`)
      const formattedDate = [day.date.slice(0, 4), day.date.slice(4, 6), day.date.slice(6, 8)].join(`-`)

      const date = document.createElement(`td`)
      date.textContent = formattedDate
      tr.appendChild(date)

      const submitted = document.createElement(`td`)
      submitted.textContent = day.submitted + day.rejected + day.approved + day.paid
      tr.appendChild(submitted)

      const approved = document.createElement(`td`)
      approved.textContent = day.approved + day.paid
      tr.appendChild(approved)

      const rejected = document.createElement(`td`)
      rejected.textContent = day.rejected
      tr.appendChild(rejected)

      const pending = document.createElement(`td`)
      pending.textContent = day.submitted
      tr.appendChild(pending)

      const ret_aban = document.createElement(`td`)
      ret_aban.textContent = day.returned + day.abandoned
      tr.appendChild(ret_aban)

      const earningsHits = document.createElement(`td`)
      earningsHits.textContent = toMoneyString(day.earnings)
      tr.appendChild(earningsHits)

      const actions = document.createElement(`span`)
      date.prepend(actions)

      const viewThisDay = document.createElement(`button`)
      viewThisDay.className = `btn btn-sm btn-primary mr-1`
      viewThisDay.textContent = `View`
      viewThisDay.addEventListener(`click`, async (event) => {
        document.getElementById(`view`).value = ``
        document.getElementById(`matching`).value = ``
        document.getElementById(`date-from`).value = formattedDate
        document.getElementById(`date-to`).value = formattedDate
        search()
      })
      actions.appendChild(viewThisDay)

      const syncThisDay = document.createElement(`button`)
      syncThisDay.className = `btn btn-sm btn-primary mr-1`
      syncThisDay.textContent = `Sync`
      syncThisDay.addEventListener(`click`, async (event) => {
        await syncDay(day.date)
        const classList = event.target.parentElement.parentElement.parentElement.classList
        classList.add(`bg-warning`)
        classList.add(`text-white`)
      })
      actions.appendChild(syncThisDay)

      if (!day.day || day.day.submitted !== (day.submitted + day.rejected + day.approved + day.paid)) {
        syncThisDay.classList.add(`btn-warning`)
      }

      results.prepend(tr)
    }
  }
}

async function search () {
  searchStart()

  const view = document.getElementById(`view`).value
  const matching = document.getElementById(`matching`).value
  const matchingType = document.getElementById(`matching-type`).value
  const dateTo = document.getElementById(`date-to`).value
  const dateFrom = document.getElementById(`date-from`).value

  const transaction = hitTrackerDB.transaction([`hit`], `readonly`)
  const objectStore = transaction.objectStore(`hit`)
  let request

  if (dateFrom || dateTo) {
    const index = objectStore.index(`date`)
    request = index.openCursor(IDBKeyRange.bound(dateFrom.replace(/-/g, ``) || `0`, dateTo.replace(/-/g, ``) || `99999999`))
  } else if (view) {
    const index = objectStore.index(`state`)
    request = index.openCursor(IDBKeyRange.only(view))
  } else {
    const index = objectStore.index(`state`)
    request = index.openCursor()
  }

  let count = 0

  const results = document.getElementById(`history-results`)

  while (results.firstChild) {
    results.removeChild(results.firstChild)
  }

  const fragment = document.createDocumentFragment()

  request.onsuccess = (event) => {
    const cursor = event.target.result

    if (cursor) {
      searchingUpdate(`Processing HIT ${++count}`)

      const value = cursor.value

      if (matching) {
        const hitValues = [value.requester_id, value.requester_name, value.title]

        if (matchingType === `contain`) {
          let contains = false

          for (const item of hitValues) {
            if (item && ~item.toLowerCase().indexOf(matching.toLowerCase())) {
              contains = true
              break
            }
          }

          if (!contains) {
            return cursor.continue()
          }
        } else if (!hitValues.includes(matching)) {
          return cursor.continue()
        }
      }

      if (view && view !== value.state) {
        return cursor.continue()
      }

      const tr = document.createElement(`tr`)

      const date_accepted = document.createElement(`td`)
      date_accepted.textContent = [value.date.slice(0, 4), value.date.slice(4, 6), value.date.slice(6, 8)].join(`-`)
      tr.appendChild(date_accepted)

      const requester_name = document.createElement(`td`)
      requester_name.textContent = value.requester_name
      tr.appendChild(requester_name)

      const title = document.createElement(`td`)
      title.textContent = value.title
      tr.appendChild(title)

      if (value.source) {
        const viewSource = document.createElement(`a`)
        viewSource.href = value.source
        viewSource.target = `_blank`
        viewSource.className = `btn btn-sm btn-primary mr-1`
        viewSource.textContent = `Src`
        title.prepend(viewSource)

        if (value.answer) {
          viewSource.title = Object.keys(value.answer).reduce((a, cV) => a += `<b>${cV}</b>: ${value.answer[cV]} <br>`, ``)

          viewSource.dataset.html = `true`
          viewSource.dataset.toggle = `tooltip`
        }
      }

      const reward = document.createElement(`td`)
      reward.textContent = toMoneyString(value.reward.amount_in_dollars)
      tr.appendChild(reward)

      const state = document.createElement(`td`)
      state.textContent = value.state
      tr.appendChild(state)

      fragment.appendChild(tr)

      return cursor.continue()
    }
  }

  transaction.oncomplete = (event) => {
    const th = document.createElement(`tr`)
    th.className = `bg-primary text-white`

    const date_accepted = document.createElement(`td`)
    date_accepted.textContent = `Date`
    th.appendChild(date_accepted)

    const requester_name = document.createElement(`td`)
    requester_name.textContent = `Name`
    th.appendChild(requester_name)

    const title = document.createElement(`td`)
    title.textContent = `Title`
    th.appendChild(title)

    const reward = document.createElement(`td`)
    reward.textContent = `Reward`
    th.appendChild(reward)

    const state = document.createElement(`td`)
    state.textContent = `Status`
    th.appendChild(state)

    $(`[data-toggle="tooltip"]`).tooltip()

    results.appendChild(th)
    results.appendChild(fragment)

    return searchEnd()
  }
}

function searchStart () {
  const modal = document.getElementById(`searching-modal`)
  searchingUpdate(`This may take some time`)

  $(modal).modal({
    backdrop: `static`,
    keyboard: false
  })
}

function searchingUpdate (message) {
  document.getElementById(`searching-message`).textContent = message || null
}

function searchEnd () {
  const modal = document.getElementById(`searching-modal`)

  $(modal).modal(`hide`)
}

function formatDate (date) {
  return [date.slice(0, 4), date.slice(4, 6), date.slice(6, 8)].join(`-`)
}

function statusStart (opts) {
  const statusModal = document.getElementById(`status-modal`)
  const statusHeader = document.getElementById(`status-header`)
  const statusMessage = document.getElementById(`status-message`)

  if (opts.header) {
    statusHeader.textContent = opts.header
  }

  if (opts.message) {
    statusMessage.textContent = opts.message
  }

  $(statusModal).modal({
    backdrop: `static`,
    keyboard: false
  })
}

function statusUpdate (opts) {
  const statusHeader = document.getElementById(`status-header`)
  const statusMessage = document.getElementById(`status-message`)

  if (opts.header) {
    statusHeader.textContent = opts.header
  }

  if (opts.message) {
    statusMessage.textContent = opts.message
  }
}

function statusEnd () {
  const statusModal = document.getElementById(`status-modal`)
  const statusHeader = document.getElementById(`status-header`)
  const statusMessage = document.getElementById(`status-message`)

  statusHeader.textContent = ``
  statusMessage.textContent = ``

  $(statusModal).modal(`hide`)
}

document.getElementById(`import`).addEventListener(`click`, (event) => document.getElementById(`import-file`).click())
document.getElementById(`import-file`).addEventListener(`change`, (event) => importFile(event.target.files[0]))
document.getElementById(`export`).addEventListener(`click`, (event) => exportFile())

// refactor needed end

function importFile () {
  const [file] = arguments

  const reader = new window.FileReader()
  reader.readAsText(file)

  reader.onload = async (event) => {
    currentStatus(`show`, `Loading File...`)

    const json = JSON.parse(event.target.result)

    if (json.hits && json.days) {
      await importFileHits(json.hits)
      await importFileDays(json.days)
    } else if (json.HIT && json.STATS) {
      const converted = importFileConvertHITDB(json)
      await importFileHits(converted.hits)
      await importFileDays(converted.days)
    }

    currentStatus(`hide`)
  }
}

function importFileHits () {
  const [hits] = arguments

  currentStatus(`update`, `Importing HITs...`)

  return new Promise((resolve) => {
    const transaction = hitTrackerDB.transaction([`hit`], `readwrite`)
    const objectStore = transaction.objectStore(`hit`)

    for (let i = 0, keys = Object.keys(hits), length = keys.length; i < length; i++) {
      const hit = hits[keys[i]]

      if (hit.hit_id && hit.requester_id && hit.state) {
        const autoAppHit = importFileIsHitAutoApp(hit)
        objectStore.put(autoAppHit)
      }
    }

    transaction.oncomplete = (event) => {
      resolve()
    }
  })
}

function importFileDays () {
  const [days] = arguments

  return new Promise(async (resolve) => {
    const datesToRecount = days.map((currentValue) => currentValue.date)
    const recounted = await importFileDaysRecount(datesToRecount)

    const transaction = hitTrackerDB.transaction([`day`], `readwrite`)
    const objectStore = transaction.objectStore(`day`)

    for (let i = 0, keys = Object.keys(days), length = keys.length; i < length; i++) {
      const day = days[keys[i]]

      if (day.day && day.day.earnings && day.date) {
        const recountedDay = {...day, ...recounted[day.date]}
        objectStore.put(recountedDay)
      }
    }

    transaction.oncomplete = (event) => {
      resolve()
    }
  })
}

function importFileConvertHITDB () {
  const [json] = arguments

  const hits = json.HIT.map((currentValue) => ({
    assignment_id: null,
    date: currentValue.date.replace(/-/g, ``),
    hit_id: currentValue.hitId,
    requester_feedback: currentValue.feedback === `` ? null : currentValue.feedback,
    requester_id: currentValue.requesterId,
    requester_name: currentValue.requesterName,
    reward: {
      amount_in_dollars: currentValue.reward,
      currency_code: null
    },
    state: currentValue.status.split(` `)[0].replace(`Pending`, `Submitted`),
    title: currentValue.title

  }))

  const days = json.STATS.map((currentValue) => ({
    day: currentValue,
    date: currentValue.date.replace(/-/g, ``),
    assigned: 0,
    returned: 0,
    abandoned: 0,
    paid: 0,
    approved: 0,
    rejected: 0,
    submitted: 0,
    earnings: 0
  }))

  return { hits: hits, days: days }
}

function importFileIsHitAutoApp () {
  const [hit] = arguments

  if (hit.state === `Approved` || hit.state === `Submitted`) {
    const isAfter30 = new Date(formatDate(hit.date)).getTime()
    const whenAfter30 = new Date(formatDate(mturkDate())).getTime() - (31 * 24 * 60 * 60 * 1000)

    if (isAfter30 < whenAfter30) {
      hit.state = `Paid`
    }
  }

  return hit
}

function importFileDaysRecount () {
  const [dates] = arguments

  const promiseData = {}

  return new Promise((resolve) => {
    const transaction = hitTrackerDB.transaction([`hit`], `readonly`)
    const objectStore = transaction.objectStore(`hit`)

    for (let i = 0, length = dates.length; i < length; i++) {
      const date = dates[i]

      const dateCount = {
        assigned: 0,
        returned: 0,
        abandoned: 0,
        paid: 0,
        approved: 0,
        rejected: 0,
        submitted: 0,
        earnings: 0
      }

      objectStore.index(`date`).openCursor(window.IDBKeyRange.only(date)).onsuccess = (event) => {
        const cursor = event.target.result

        if (cursor) {
          const state = cursor.value.state.toLowerCase()

          dateCount[state] ++

          if (state.match(/paid/)) dateCount.earnings += cursor.value.reward.amount_in_dollars

          cursor.continue()
        } else {
          dateCount.earnings = dateCount.earnings.toFixed(2)
          promiseData[date] = dateCount
        }
      }
    }

    transaction.oncomplete = (event) => {
      resolve(promiseData)
    }
  })
}

async function exportFile () {
  currentStatus(`show`, `Getting Data...`)

  const data = JSON.stringify({
    hits: await exportFileHits(),
    days: await exportFileDays()
  })

  currentStatus(`update`, `Generating File...`)

  const exportFile = document.getElementById(`export-file`)
  exportFile.href = window.URL.createObjectURL(new window.Blob([data], { type: `application/json` }))
  exportFile.download = `HIT_Tracker_Backup_${mturkDate()}.json`
  exportFile.click()

  currentStatus(`hide`)
}

function exportFileHits () {
  let index = 0
  const promiseData = []

  return new Promise((resolve) => {
    const transaction = hitTrackerDB.transaction([`hit`], `readonly`)
    const objectStore = transaction.objectStore(`hit`)

    objectStore.openCursor().onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        promiseData.push(event.target.result.value)
        cursor.continue()
      }

      currentStatus(`update`, `Processing HITs... ${++index}`)
    }

    transaction.oncomplete = (event) => {
      resolve(promiseData)
    }
  })
}

function exportFileDays () {
  let index = 0
  const promiseData = []

  return new Promise((resolve) => {
    const transaction = hitTrackerDB.transaction([`day`], `readonly`)
    const objectStore = transaction.objectStore(`day`)

    objectStore.openCursor().onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        promiseData.push(event.target.result.value)
        cursor.continue()
      }

      currentStatus(`update`, `Processing Days... ${++index}`)
    }

    transaction.oncomplete = (event) => {
      resolve(promiseData)
    }
  })
}

function currentStatus () {
  const [type, message] = arguments

  const statusModal = document.getElementById(`status-modal`)

  if (type === `show`) $(statusModal).modal({ backdrop: `static`, keyboard: false })
  else if (type === `hide`) $(statusModal).modal(`hide`)

  document.getElementById(`status-message`).textContent = message || ``
}

function toMoneyString () {
  const [string] = arguments
  return `$${Number(string).toFixed(2).toLocaleString(`en-US`, { minimumFractionDigits: 2 })}`
}
