/* globals storage */

// Grabs worker id from storage and inputs the worker id into the input field.
function inputWorkerId (info, tab) {
  chrome.tabs.executeScript(tab.id, {
    code: `elem = document.activeElement; elem.value += '${storage.workerId}'; elem.dispatchEvent(new Event('change', { bubbles: true }));`,
    frameId: info.frameId,
    allFrames: true
  })
}

// Parses out the requester id from the url and opens the contact link in a new tab.
function contactRequester (info, tab) {
  const match = info.linkUrl.match(/([A-Z0-9]+)/)
  const requesterId = match ? match[1] : null

  if (requesterId) {
    window.open(`https://worker.mturk.com/contact_requester/hit_type_messages/new?hit_type_message[hit_type_id]=YOURMTURKHIT&hit_type_message[requester_id]=${requesterId}`)
  }
}

// Parses out the hit set id from the url and sends it to HIT Catcher to catch one HIT.
function hitCatcherOnce (info, tab) {
  const match = info.linkUrl.match(/projects\/([A-Z0-9]+)\/tasks/)
  const hitSetId = match ? match[1] : null

  if (hitSetId) {
    chrome.runtime.sendMessage({
      hitCatcher: {
        id: hitSetId,
        name: ``,
        once: true,
        sound: true
      }
    })
  }
}

// Parses out the hit set id from the url and sends it to HIT Catcher to catch multiple HITs.
function hitCatcherMultiple (info, tab) {
  const match = info.linkUrl.match(/projects\/([A-Z0-9]+)\/tasks/)
  const hitSetId = match ? match[1] : null

  if (hitSetId) {
    chrome.runtime.sendMessage({
      hitCatcher: {
        id: hitSetId,
        name: ``,
        once: false,
        sound: false
      }
    })
  }
}

// Creates the menu item to input your worker id to input fields.
chrome.contextMenus.create({
  title: `Input Mturk Worker ID`,
  contexts: [`editable`],
  onclick: inputWorkerId
})

// Creates the menu item to open a new tab to contact a requester.
chrome.contextMenus.create({
  title: `Contact Requester`,
  contexts: [`link`],
  targetUrlPatterns: [`https://worker.mturk.com/requesters/*`],
  onclick: contactRequester
})

// Creates the menu item to send a hit set id to HIT Catcher to catch one HIT.
chrome.contextMenus.create({
  title: `HIT Catcher - Once`,
  contexts: [`link`],
  targetUrlPatterns: [`https://worker.mturk.com/projects/*/tasks*`],
  onclick: hitCatcherOnce
})

// Creates the menu item to send a hit set id to HIT Catcher to catch multiple HITs.
chrome.contextMenus.create({
  title: `HIT Catcher - Multiple`,
  contexts: [`link`],
  targetUrlPatterns: [`https://worker.mturk.com/projects/*/tasks*`],
  onclick: hitCatcherMultiple
})
