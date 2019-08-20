/* globals chrome $ */

const finderDB = {};
const reviewsDB = {};
const turkerviewDB = {};
const turkopticonDB = {};
const includeAlerted = [];
const includePushbulleted = [];

let totalScans = 0;
let pageRequestErrors = 0;
let alarm = false;
let alarmAudio = null;
let alarmRunning = false;
let finderTimeout = null;

const storage = {};

chrome.storage.local.get([`hitFinder`, `blockList`, `includeList`, `reviews`], (keys) => {
  for (const key of Object.keys(keys)) {
    storage[key] = keys[key];
  }

  finderUpdate();
  blockListUpdate();
  includeListUpdate();
});

function finderApply() {
  for (const prop in storage.hitFinder) {
    storage.hitFinder[prop] = document.getElementById(prop)[
      typeof storage.hitFinder[prop] === `boolean` ? `checked` : `value`
    ];
  }

  chrome.storage.local.set({
    hitFinder: storage.hitFinder,
  });
}

function finderUpdate() {
  for (const prop in storage.hitFinder) {
    document.getElementById(prop)[typeof storage.hitFinder[prop] === `boolean` ? `checked` : `value`] =
      storage.hitFinder[prop];
  }
}

function finderToggle() {
  const active = document.getElementById(`find`).classList.toggle(`active`);

  if (active) {
    finderFetch();
  }
}

function finderFetchURL() {
  const url = new window.URL(`https://worker.mturk.com/`);
  url.searchParams.append(`sort`, storage.hitFinder[`filter-sort`]);
  url.searchParams.append(`page_size`, storage.hitFinder[`filter-page-size`]);
  url.searchParams.append(`filters[masters]`, storage.hitFinder[`filter-masters`]);
  url.searchParams.append(`filters[qualified]`, storage.hitFinder[`filter-qualified`]);
  url.searchParams.append(`filters[min_reward]`, storage.hitFinder[`filter-min-reward`]);
  url.searchParams.append(`filters[search_term]`, storage.hitFinder[`filter-search-term`]);
  url.searchParams.append(`format`, `json`);

  return url;
}

function finderNextFetch() {
  const [lastScan] = arguments;

  const speed = Number(storage.hitFinder.speed);

  if (speed > 0) {
    const delay = lastScan + speed - window.performance.now();
    finderTimeout = setTimeout(finderFetch, delay);
  } else {
    finderToggle();
  }
}

function finderLoggedOut() {
  finderToggle();
  window.textToSpeech(`HIT Finder Stopped, you are logged out of MTurk.`, `Google US English`);
}

async function finderFetch() {
  const start = window.performance.now();

  clearTimeout(finderTimeout);

  if (!document.getElementById(`find`).classList.contains(`active`)) {
    return;
  }

  try {
    const response = await window.fetch(finderFetchURL(), {
      credentials: `include`,
    });

    if (~response.url.indexOf(`https://worker.mturk.com`)) {
      if (response.ok) {
        await finderProcess(await response.json());
      }
      if (response.status === 429) {
        document.getElementById(`page-request-errors`).textContent = ++pageRequestErrors;
      }

      finderNextFetch(start);
    } else {
      finderLoggedOut();
    }
  } catch (error) {
    console.error(error);
    finderNextFetch(start);
  } finally {
    document.getElementById(`total-scans`).textContent = ++totalScans;
  }
}

function finderProcess() {
  return new Promise(async (resolve) => {
    const [json] = arguments;

    const recentFragment = document.createDocumentFragment();
    const loggedFragment = document.createDocumentFragment();
    const includedFragment = document.createDocumentFragment();
    let sound = false;
    let blocked = 0;

    reviewsForFinder([...new Set(json.results.map((o) => o.requester_id))]);

    for (const hit of json.results) {
      if (blockListed(hit) || minimumAvailable(hit) || minimumRequesterRating(hit)) {
        blocked++;
        continue;
      }

      const included = includeListed(hit);
      const requesterTVReviewClass = await turkerviewReviewClass(hit.requester_id);
      const requesterReviewClass = await turkopticonReviewClass(hit.requester_id);
      const trackerRequester = await hitTrackerMatchObject(`requester_id`, hit.requester_id);
      const trackerTitle = await hitTrackerMatchObject(`title`, hit.title);
      const hfOptions = await StorageGetKey(`hitFinder`);

      const row = document.createElement(`tr`);
      row.classList.add(`row-${hit.requester_id}`);

      if (included) {
        row.classList.add(`included`);
      }

      if (storage.hitFinder[`display-colored-rows`]) {
        if (requesterTVReviewClass !== `default`) {
          row.classList.add(`tv`, `table-${requesterTVReviewClass}`);
        } else {
          row.classList.add(`table-${requesterReviewClass}`);
        }
      }

      const actions = document.createElement(`td`);
      actions.className = `w-1`;
      row.appendChild(actions);

      const actionsContainer = document.createElement(`div`);
      actionsContainer.className = `btn-group`;
      actions.appendChild(actionsContainer);

      const hitInfo = document.createElement(`button`);
      hitInfo.type = `button`;
      hitInfo.className = `btn btn-sm btn-primary`;
      hitInfo.dataset.toggle = `modal`;
      hitInfo.dataset.target = `#hit-info-modal`;
      hitInfo.dataset.key = hit.hit_set_id;
      actionsContainer.appendChild(hitInfo);

      const hitInfoIcon = document.createElement(`i`);
      hitInfoIcon.className = `fa fa-info-circle`;
      hitInfo.appendChild(hitInfoIcon);

      const time = document.createElement(`td`);
      time.className = `w-1`;
      time.textContent = timeNow();
      row.appendChild(time);

      const requester = document.createElement(`td`);
      row.appendChild(requester);

      const requesterContainer = document.createElement(`div`);
      requesterContainer.className = `btn-group`;
      requester.appendChild(requesterContainer);

      const requesterTurkerViewReviews = document.createElement(`button`);
      requesterTurkerViewReviews.className = `btn btn-sm btn-${
        hit.requester_id
      } btn-${requesterTVReviewClass} btn-turkerview`;
      requesterTurkerViewReviews.dataset.toggle = `modal`;
      requesterTurkerViewReviews.dataset.target = `#requester-review-modal`;
      requesterTurkerViewReviews.dataset.key = hit.requester_id;

      const turkerviewIcon = document.createElement(`img`);
      turkerviewIcon.src = chrome.extension.getURL(`media/images/tv-white.png`);
      turkerviewIcon.style.maxHeight = `13px`;
      requesterTurkerViewReviews.appendChild(turkerviewIcon);
      requesterContainer.appendChild(requesterTurkerViewReviews);

      const requesterReviews = document.createElement(`button`);
      requesterReviews.className = `btn btn-sm btn-${hit.requester_id} btn-${requesterReviewClass} btn-turkopticon`;
      requesterReviews.dataset.toggle = `modal`;
      requesterReviews.dataset.target = `#requester-review-modal`;
      requesterReviews.dataset.key = hit.requester_id;
      requesterContainer.appendChild(requesterReviews);

      const requesterReviewsIcon = document.createElement(`i`);
      requesterReviewsIcon.className = `fa fa-user`;
      requesterReviews.appendChild(requesterReviewsIcon);

      const requesterTracker = document.createElement(`button`);
      requesterTracker.type = `button`;
      requesterTracker.className = `btn btn-sm btn-${trackerRequester.color} mr-1`;
      requesterContainer.appendChild(requesterTracker);

      const requesterTrackerIcon = document.createElement(`i`);
      requesterTrackerIcon.className = `fa fa-${trackerRequester.icon}`;
      requesterTracker.appendChild(requesterTrackerIcon);

      const requesterLink = document.createElement(`a`);
      requesterLink.href = `https://worker.mturk.com/requesters/${hit.requester_id}/projects`;
      requesterLink.target = `_blank`;
      requesterLink.textContent = hit.requester_name;
      requesterContainer.appendChild(requesterLink);

      const title = document.createElement(`td`);
      row.appendChild(title);

      const titleContainer = document.createElement(`div`);
      titleContainer.className = `btn-group`;
      title.appendChild(titleContainer);

      const sharer = document.createElement(`button`);
      sharer.type = `button`;
      sharer.className = `btn btn-sm btn-primary`;
      sharer.dataset.toggle = `modal`;
      sharer.dataset.target = `#hit-sharer-modal`;
      sharer.dataset.key = hit.hit_set_id;
      titleContainer.appendChild(sharer);

      const shareIcon = document.createElement(`i`);
      shareIcon.className = `fa fa-share`;
      sharer.appendChild(shareIcon);

      const titleTracker = document.createElement(`button`);
      titleTracker.type = `button`;
      titleTracker.className = `btn btn-sm btn-${trackerTitle.color} mr-1`;
      titleContainer.appendChild(titleTracker);

      const titleTrackerIcon = document.createElement(`i`);
      titleTrackerIcon.className = `fa fa-${trackerTitle.icon}`;
      titleTracker.appendChild(titleTrackerIcon);

      const titleLink = document.createElement(`a`);
      titleLink.href = `https://worker.mturk.com/projects/${hit.hit_set_id}/tasks`;
      titleLink.target = `_blank`;
      titleLink.textContent = hit.title;
      titleContainer.appendChild(titleLink);

      const available = document.createElement(`td`);
      available.className = `text-center w-1`;
      available.textContent = hit.assignable_hits_count;
      row.appendChild(available);

      const reward = document.createElement(`td`);
      reward.className = `text-center`;
      row.appendChild(reward);

      const rewardLink = document.createElement(`a`);
      rewardLink.href = `https://worker.mturk.com/projects/${hit.hit_set_id}/tasks/accept_random`;
      rewardLink.target = `_blank`;
      rewardLink.textContent = toMoneyString(hit.monetary_reward.amount_in_dollars);
      reward.appendChild(rewardLink);

      const masters = document.createElement(`td`);
      masters.className = `text-center w-1`;
      masters.textContent =
        hit.project_requirements.filter((o) =>
          [
            `2F1QJWKUDD8XADTFD2Q0G6UTO95ALH`,
            `2NDP2L92HECWY8NS8H3CK0CP5L9GHO`,
            `21VZU98JHSTLZ5BPP4A9NOBJEK3DPG`,
          ].includes(o.qualification_type_id),
        ).length > 0
          ? `Y`
          : `N`;
      row.appendChild(masters);

      const hitCatcher = document.createElement(`td`);
      hitCatcher.className = `text-center w-1`;
      row.appendChild(hitCatcher);

      const hitCatcherContainer = document.createElement(`div`);
      hitCatcherContainer.className = `btn-group`;
      hitCatcher.appendChild(hitCatcherContainer);

      const once = document.createElement(`button`);
      once.type = `button`;
      once.className = `btn btn-sm btn-primary px-2 py-0 hit-catcher`;
      once.dataset.key = hit.hit_set_id;
      once.dataset.name = `once`;
      once.textContent = `O`;
      hitCatcherContainer.appendChild(once);

      const panda = document.createElement(`button`);
      panda.type = `button`;
      panda.className = `btn btn-sm btn-primary px-2 py-0 hit-catcher`;
      panda.dataset.key = hit.hit_set_id;
      panda.dataset.name = `panda`;
      panda.textContent = `P`;
      hitCatcherContainer.appendChild(panda);

      const recentRow = toggleColumns(row.cloneNode(true), `recent`);
      recentRow.id = `recent-${hit.hit_set_id}`;

      const loggedRow = toggleColumns(row.cloneNode(true), `logged`);
      loggedRow.id = `logged-${hit.hit_set_id}`;

      const includedRow = toggleColumns(row.cloneNode(true), `included`);
      includedRow.id = `included-${hit.hit_set_id}`;

      recentFragment.appendChild(recentRow);

      const loggedElement = document.getElementById(`logged-${hit.hit_set_id}`);
      if (loggedElement) loggedElement.replaceWith(loggedRow);
      else loggedFragment.appendChild(loggedRow);

      if (!finderDB[hit.hit_set_id]) {
        sound = true;
        finderDB[hit.hit_set_id] = hit;
      }

      if (included && !includeAlerted.includes(hit.hit_set_id)) {
        includedAlert(included, hit);
        document.getElementById(`include-list-hits-card`).style.display = ``;
        includedFragment.appendChild(includedRow);
      }
    }

    toggleColumns(document.getElementById(`recent-hits-thead`).children[0], `recent`);
    toggleColumns(document.getElementById(`logged-hits-thead`).children[0], `logged`);
    removeChildren(document.getElementById(`recent-hits-tbody`));

    document
      .getElementById(`recent-hits-tbody`)
      .insertBefore(recentFragment, document.getElementById(`recent-hits-tbody`).firstChild);
    document
      .getElementById(`logged-hits-tbody`)
      .insertBefore(loggedFragment, document.getElementById(`logged-hits-tbody`).firstChild);
    document
      .getElementById(`include-list-hits-tbody`)
      .insertBefore(includedFragment, document.getElementById(`include-list-hits-tbody`).firstChild);

    if (sound && storage.hitFinder[`alert-new-sound`] !== `none`) {
      const audio = new window.Audio();
      audio.src = `/media/audio/${storage.hitFinder[`alert-new-sound`]}.ogg`;
      audio.play();
    }

    document.getElementById(`hits-found`).textContent = `Found: ${
      json.num_results
    } | Blocked: ${blocked} | ${new Date().toLocaleTimeString()}`;
    document.getElementById(`hits-logged`).textContent = document.getElementById(`logged-hits-tbody`).children.length;

    resolve();
  });
}

function minimumAvailable() {
  const [hit] = arguments;

  if (hit.assignable_hits_count < Number(storage.hitFinder[`filter-min-available`])) {
    return true;
  }

  return false;
}

function minimumRequesterRating() {
  const [hit] = arguments;

  const ratingAverage = turkopticonAverage(hit.requester_id);

  if (ratingAverage > 0 && ratingAverage < Number(storage.hitFinder[`filter-min-requester-rating`])) {
    return true;
  }

  return false;
}

function blockListed(hit) {
  for (const match in storage.blockList) {
    const bl = storage.blockList[match];
    if (bl.strict) {
      const compared = strictCompare(match, [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title]);
      if (compared === true) {
        return true;
      }
    } else {
      const compared = looseCompare(match, [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title]);
      if (compared === true) {
        return true;
      }
    }
  }
  return false;
}

function includeListed(hit) {
  for (const match in storage.includeList) {
    const il = storage.includeList[match];
    if (il.strict) {
      const compared = strictCompare(match, [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title]);
      if (compared === true) {
        return il;
      }
    } else {
      const compared = looseCompare(match, [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title]);
      if (compared === true) {
        return il;
      }
    }
  }
  return false;
}

function includedAlert(il, hit) {
  const alerted = includeAlerted.includes(hit.hit_set_id);
  const pushbulleted = includePushbulleted.includes(hit.hit_set_id);

  if (alerted) {
    return;
  }

  if (alarm && il.alarm === true) {
    alarmSound();
  }

  if (il.sound === true) {
    if (storage.hitFinder[`alert-include-sound`] === `voice`) {
      window.textToSpeech(`Include list match found! ${il.name}`, `Google US English`);
    } else {
      const audio = new window.Audio();
      audio.src = `/media/audio/${storage.hitFinder[`alert-include-sound`]}.ogg`;
      audio.play();
    }
  }

  if (il.notification) {
    try {
      chrome.notifications.create(hit.hit_set_id, {
        type: `list`,
        message: `Match`,
        title: `Include list match found!`,
        iconUrl: `/media/icon_128.png`,
        items: [
          { title: `Title`, message: hit.title },
          { title: `Requester`, message: hit.requester_name },
          { title: `Reward`, message: toMoneyString(hit.monetary_reward.amount_in_dollars) },
          { title: `Available`, message: hit.assignable_hits_count.toString() },
        ],
        ...(window.chrome ? { buttons: [{ title: `Preview` }, { title: `Accept` }] } : null),
      });
    } catch (error) {
      chrome.notifications.create(hit.hit_set_id, {
        type: `list`,
        message: `Match`,
        title: `Include list match found!`,
        iconUrl: `/media/icon_128.png`,
        items: [
          { title: `Title`, message: hit.title },
          { title: `Requester`, message: hit.requester_name },
          { title: `Reward`, message: toMoneyString(hit.monetary_reward.amount_in_dollars) },
          { title: `Available`, message: hit.assignable_hits_count.toString() },
        ],
      });
    }
  }

  if (il.pushbullet && storage.hitFinder[`alert-pushbullet-state`] === `on` && pushbulleted === false) {
    $.ajax({
      type: `POST`,
      url: `https://api.pushbullet.com/v2/pushes`,
      headers: {
        Authorization: `Bearer ${storage.hitFinder[`alert-pushbullet-token`]}`,
      },
      data: {
        type: `note`,
        title: `Include list match found!`,
        body: `Title: ${hit.title}\nReq: ${hit.requester_name}\nReward: ${toMoneyString(
          hit.monetary_reward.amount_in_dollars,
        )}\nAvail: ${hit.assignable_hits_count}`,
      },
    });

    includePushbulleted.unshift(hit.hit_set_id);

    setTimeout(() => {
      includePushbulleted.pop();
    }, 900000);
  }

  includeAlerted.unshift(hit.hit_set_id);

  setTimeout(() => {
    includeAlerted.pop();
  }, Number(storage.hitFinder[`alert-include-delay`]) * 60000);
}

function strictCompare(string, array) {
  for (const value of array) {
    if (string === value) {
      return true;
    }
  }
  return false;
}

function looseCompare(string, array) {
  for (const value of array) {
    if (value.toLowerCase().indexOf(string.toLowerCase()) !== -1) {
      return true;
    }
  }
  return false;
}

function alarmSound() {
  if (!alarm || alarmRunning) {
    return;
  }

  alarmAudio = new window.Audio();
  alarmAudio.src = `/media/audio/alarm.ogg`;
  alarmAudio.loop = true;
  alarmAudio.play();

  alarmRunning = true;
}

function blockListUpdate() {
  const sorted = Object.keys(storage.blockList)
    .map((currentValue) => {
      storage.blockList[currentValue].term = currentValue;
      return storage.blockList[currentValue];
    })
    .sort((a, b) => a.name.localeCompare(b.name, `en`, { numeric: true }));

  const body = document.getElementById(`block-list-modal`).getElementsByClassName(`modal-body`)[0];

  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  body.appendChild(
    (() => {
      const fragment = document.createDocumentFragment();

      for (const bl of sorted) {
        const button = document.createElement(`button`);
        button.type = `button`;
        button.className = `btn btn-sm btn-danger ml-1 my-1 bl-btn`;
        button.textContent = bl.name;
        button.dataset.toggle = `modal`;
        button.dataset.target = `#block-list-edit-modal`;
        button.dataset.key = bl.match;
        fragment.appendChild(button);
      }

      return fragment;
    })(),
  );

  for (const key in finderDB) {
    const hit = finderDB[key];

    if (blockListed(hit)) {
      const recent = document.getElementById(`recent-${hit.hit_set_id}`);
      const logged = document.getElementById(`logged-${hit.hit_set_id}`);
      const included = document.getElementById(`included-${hit.hit_set_id}`);

      if (recent) recent.parentNode.removeChild(recent);
      if (logged) logged.parentNode.removeChild(logged);
      if (included) included.parentNode.removeChild(included);

      delete finderDB[key];
    }
  }

  chrome.storage.local.set({
    blockList: storage.blockList,
  });
}

function includeListUpdate() {
  const sorted = Object.keys(storage.includeList)
    .map((currentValue) => {
      storage.includeList[currentValue].match = currentValue;
      return storage.includeList[currentValue];
    })
    .sort((a, b) => a.name.localeCompare(b.name, `en`, { numeric: true }));

  const body = document.getElementById(`include-list-modal`).getElementsByClassName(`modal-body`)[0];

  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  body.appendChild(
    (() => {
      const fragment = document.createDocumentFragment();

      for (const il of sorted) {
        const button = document.createElement(`button`);
        button.type = `button`;
        button.className = `btn btn-sm btn-success ml-1 my-1 il-btn`;
        button.textContent = il.name;
        button.dataset.toggle = `modal`;
        button.dataset.target = `#include-list-edit-modal`;
        button.dataset.key = il.match;
        fragment.appendChild(button);
      }

      return fragment;
    })(),
  );

  for (const key in finderDB) {
    const hit = finderDB[key];

    const element = document.getElementById(`logged-${hit.hit_set_id}`);

    if (element) {
      if (includeListed(hit)) {
        element.classList.add(`included`);
      } else {
        element.classList.remove(`included`);
      }
    }
  }

  chrome.storage.local.set({
    includeList: storage.includeList,
  });
}

function requesterHourlyTVClass(hourly) {
  if (hourly == null) return `text-muted`;

  if (hourly > 10.5) return `text-success`;
  if (hourly > 7.25) return `text-warning`;
  if (hourly > 0.0) return `text-danger`;
  return `text-muted`;
}

chrome.storage.local.get(`options`, (keys) => {
  const { options } = keys;

  if (options.turkerviewApiKey.length == 40 || options[`disable-tv-announcement`] || !options.turkerview)
    document.getElementById(`tv-finder-announce`).style.display = `none`;

  document.getElementById(`view-api-save`).addEventListener(`click`, function() {
    const temp_api_key = document.getElementById(`view-api-key`).value;

    if (temp_api_key.length == 40) {
      options.turkerviewApiKey = temp_api_key;
      chrome.storage.local.set({ options });
      alert(`Awesome, we saved your API key for future use!`);
      window.location.reload();
    } else {
      alert(`We cannot save the provided key as it isn't valid.`);
    }
  });

  document.getElementById(`disable-finder-tv-announcement`).addEventListener(`click`, function() {
    options[`disable-tv-announcement`] = true;
    chrome.storage.local.set({ options });
    $(`#turkerview-finder-announcement-modal`).modal(`toggle`);
    document.getElementById(`tv-finder-announce`).style.display = `none`;
  });
});

function timeNow() {
  const date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? `p` : `a`;
  hours %= 12;
  hours = hours || 12;
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minutes}${ampm}`;
}

function toggleColumns() {
  const [element, type] = arguments;

  element.children[1].style.display = storage.hitFinder[`display-${type}-column-time`] ? `` : `none`;
  element.children[2].style.display = storage.hitFinder[`display-${type}-column-requester`] ? `` : `none`;
  element.children[3].style.display = storage.hitFinder[`display-${type}-column-title`] ? `` : `none`;
  element.children[4].style.display = storage.hitFinder[`display-${type}-column-available`] ? `` : `none`;
  element.children[5].style.display = storage.hitFinder[`display-${type}-column-reward`] ? `` : `none`;
  element.children[6].style.display = storage.hitFinder[`display-${type}-column-masters`] ? `` : `none`;
  element.children[7].style.display = storage.hitFinder[`display-${type}-column-hit-catcher`] ? `` : `none`;

  return element;
}

function removeChildren() {
  const [element] = arguments;

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function toMoneyString() {
  const [string] = arguments;
  return `$${Number(string)
    .toFixed(2)
    .toLocaleString(`en-US`, { minimumFractionDigits: 2 })}`;
}

function toDurationString() {
  const [string] = arguments;

  let seconds = string;
  let minute = Math.floor(seconds / 60);
  seconds %= 60;
  let hour = Math.floor(minute / 60);
  minute %= 60;
  const day = Math.floor(hour / 24);
  hour %= 24;

  let durationString = ``;

  if (day > 0) durationString += `${day} day${day > 1 ? `s` : ``} `;
  if (hour > 0) durationString += `${hour} hour${hour > 1 ? `s` : ``} `;
  if (minute > 0) durationString += `${minute} minute${minute > 1 ? `s` : ``}`;

  return durationString.trim();
}

chrome.notifications.onButtonClicked.addListener((id, btn) => {
  if (btn === 0) {
    window.open(`https://worker.mturk.com/projects/${id}/tasks`);
  }
  if (btn === 1) {
    window.open(`https://worker.mturk.com/projects/${id}/tasks/accept_random`);
  }

  chrome.notifications.clear(id);
});

const turkerviewClass = ({ wages }) => {
  if (!wages) return `default`;
  if (wages.average.wage > 10.5) return `success`;
  if (wages.average.wage > 7.25) return `warning`;
  if (wages.average.wage > 0.0) return `danger`;
  return `default`;
};

const turkerviewReviewClass = (rid) => {
  const review = turkerviewDB[rid];
  return review ? turkerviewClass(review) : `default`;
};

const turkopticonClass = ({ average }) => {
  if (average > 3.75) return `success`;
  if (average > 2.25) return `warning`;
  if (average > 0.0) return `danger`;
  return `default`;
};

const turkopticonReviewClass = (rid) => {
  const review = turkopticonDB[rid];
  return review ? turkopticonClass(review) : `default`;
};

const turkopticonAverage = (rid) => {
  const review = turkopticonDB[rid];
  return review ? review.average : 0;
};

async function handleTurkerview(rids) {
  const reviews = await new Promise((resolve) =>
    chrome.runtime.sendMessage({ type: `GET_TURKERVIEW`, payload: rids }, resolve),
  );

  Object.entries(reviews).forEach(([rid, review]) => {
    turkerviewDB[rid] = review;

    document.querySelectorAll(`.btn-${rid}.btn-turkerview`).forEach((el) => {
      el.classList.remove(`btn-success`, `btn-warning`, `btn-danger`);
      el.classList.add(`btn-${turkerviewClass(review)}`);
    });

    document.querySelectorAll(`.row-${rid}`).forEach((el) => {
      if (storage.hitFinder[`display-colored-rows`]) {
        const classIs = turkerviewClass(review);

        // Has been colored by TV
        if (classIs !== `default`) {
          el.classList.remove(`table-default`, `table-success`, `table-warning`, `table-danger`);
          el.classList.add(`tv`);
        }

        el.classList.add(`table-${classIs}`);
      }
    });
  });
}

async function handleTurkopticon(rids) {
  const reviews = await new Promise((resolve) =>
    chrome.runtime.sendMessage({ type: `GET_TURKOPTICON`, payload: rids }, resolve),
  );

  Object.entries(reviews).forEach(([rid, review]) => {
    turkopticonDB[rid] = review;

    document.querySelectorAll(`.btn-${rid}.btn-turkopticon`).forEach((el) => {
      el.classList.remove(`btn-success`, `btn-warning`, `btn-danger`);
      el.classList.add(`btn-${turkopticonClass(review)}`);
    });

    document.querySelectorAll(`.row-${rid}`).forEach((el) => {
      if (storage.hitFinder[`display-colored-rows`] && !el.classList.contains(`tv`)) {
        el.classList.remove(`table-default`, `table-success`, `table-warning`, `table-danger`);
        el.classList.add(`table-${turkopticonClass(review)}`);
      }
    });
  });
}

function reviewsForFinder(rids) {
  chrome.storage.local.get([`options`], ({ options }) => {
    if (options.turkopticon) {
      handleTurkopticon(rids);
    }

    if (options.turkerview) {
      handleTurkerview(rids);
    }
  });
}

let hitTrackerDB = (() => {
  const open = window.indexedDB.open(`hitTrackerDB`, 1);

  open.onsuccess = (event) => {
    hitTrackerDB = event.target.result;
  };
})();

function hitTrackerMatch() {
  const [name, value] = arguments;

  let resolveValue;

  return new Promise((resolve) => {
    const transaction = hitTrackerDB.transaction([`hit`], `readonly`);
    const objectStore = transaction.objectStore(`hit`);
    const myIndex = objectStore.index(name);
    const myIDBKeyRange = window.IDBKeyRange.only(value);

    myIndex.openCursor(myIDBKeyRange).onsuccess = (event) => {
      const cursor = event.target.result;

      if (cursor) {
        if (cursor.value.state.match(/Submitted|Approved|Rejected|Paid/)) {
          resolveValue = true;
        } else {
          cursor.continue();
        }
      } else {
        resolveValue = false;
      }
    };

    transaction.oncomplete = (event) => {
      resolve(resolveValue);
    };
  });
}

function hitTrackerMatchObject() {
  const [name, value] = arguments;

  let resolveValue;

  return new Promise(async (resolve) => {
    const match = await hitTrackerMatch(name, value);
    resolveValue = match ? { color: `success`, icon: `check` } : { color: `secondary`, icon: `minus` };
    resolve(resolveValue);
  });
}

function saveToFileJSON() {
  const [name, json] = arguments;

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const year = today.getFullYear();
  const date = `${year}${month < 10 ? `0` : ``}${month}${day < 10 ? `0` : ``}${day}`;

  const data = JSON.stringify(json);

  const exportFile = document.createElement(`a`);
  exportFile.href = window.URL.createObjectURL(new window.Blob([data], { type: `application/json` }));
  exportFile.download = `mts-backup-${date}-${name}.json`;

  document.body.appendChild(exportFile);
  exportFile.click();
  document.body.removeChild(exportFile);
}

function loadFromFileJSON() {
  const [file] = arguments;

  return new Promise((resolve) => {
    const reader = new window.FileReader();
    reader.readAsText(file);

    reader.onload = (event) => {
      const json = JSON.parse(event.target.result);
      resolve(json);
    };
  });
}

$(`[data-toggle="tooltip"]`).tooltip({
  delay: {
    show: 500,
  },
});

$(`body`).on(`click`, `.hit-catcher`, async (event) => {
  const opened = await new Promise(resolve =>
    chrome.runtime.sendMessage({ hitCatcher: `open` }, (open) => {
      const err = chrome.runtime.lastError;
      if (err) {
        alert(`Hit Catcher does not appear to be running.`);
      } else {
        resolve(open);
      }
    })
  );

  if (opened) {
    const key = event.target.dataset.key;
    const once = event.target.dataset.name === `once` ? true : false;
    const hit = finderDB[key];

    chrome.runtime.sendMessage({
      hitCatcher: {
        id: key,
        name: ``,
        once: once,
        sound: once,
        project: {
          requester_name: hit.requester_name,
          requester_id: hit.requester_id,
          title: hit.title,
          hit_set_id: hit.hit_set_id,
          monetary_reward: {
            amount_in_dollars: hit.monetary_reward.amount_in_dollars
          },
          assignment_duration_in_seconds: hit.assignment_duration_in_seconds,
          project_requirements: hit.project_requirements
        }
      }
    });

    const elem = once ? 0 : 1;

    const includedRow = document.getElementById(`included-${hit.hit_set_id}`);
    if (includedRow) {
      includedRow.children[7].firstChild.children[elem].classList
        .replace(`btn-primary`, `btn-secondary`);
    }

    document.getElementById(`recent-${hit.hit_set_id}`)
      .children[7].firstChild.children[elem].classList
      .replace(`btn-primary`, `btn-secondary`);

    const loggedClassList = document.getElementById(`logged-${hit.hit_set_id}`)
      .children[7].firstChild.children[elem].classList
      .replace(`btn-primary`, `btn-secondary`);
  }
});

$(`#block-list-add-modal`).on(`show.bs.modal`, (event) => {
  const name = event.relatedTarget.dataset.name;
  const match = event.relatedTarget.dataset.match;

  document.getElementById(`block-list-add-name`).value = name || ``;
  document.getElementById(`block-list-add-match`).value = match || ``;
  document.getElementById(`block-list-add-strict`).checked = true;
});

$(`#block-list-edit-modal`).on(`show.bs.modal`, (event) => {
  const key = event.relatedTarget.dataset.key;
  const item = storage.blockList[key];

  document.getElementById(`block-list-edit-name`).value = item.name;
  document.getElementById(`block-list-edit-match`).value = item.match;
  document.getElementById(`block-list-edit-strict`).checked = item.strict;

  document.getElementById(`block-list-edit-delete`).dataset.key = key;
});

$(`#include-list-add-modal`).on(`show.bs.modal`, (event) => {
  const name = event.relatedTarget.dataset.name;
  const match = event.relatedTarget.dataset.match;

  document.getElementById(`include-list-add-name`).value = name || ``;
  document.getElementById(`include-list-add-match`).value = match || ``;
  document.getElementById(`include-list-add-strict`).checked = true;
  document.getElementById(`include-list-add-sound`).checked = true;
  document.getElementById(`include-list-add-alarm`).checked = false;
  document.getElementById(`include-list-add-notification`).checked = true;
  document.getElementById(`include-list-add-pushbullet`).checked = false;
});

$(`#include-list-edit-modal`).on(`show.bs.modal`, (event) => {
  const key = event.relatedTarget.dataset.key;
  const item = storage.includeList[key];

  document.getElementById(`include-list-edit-name`).value = item.name;
  document.getElementById(`include-list-edit-match`).value = item.match;
  document.getElementById(`include-list-edit-strict`).checked = item.strict;
  document.getElementById(`include-list-edit-sound`).checked = item.sound;
  document.getElementById(`include-list-edit-alarm`).checked = item.alarm;
  document.getElementById(`include-list-edit-notification`).checked = item.notification;
  document.getElementById(`include-list-edit-pushbullet`).checked = item.pushbullet;

  document.getElementById(`include-list-edit-delete`).dataset.key = key;
});

$(`#settngs-modal`).on(`show.bs.modal`, (event) => {
  for (const prop in storage.hitFinder) {
    document.getElementById(prop)[typeof storage.hitFinder[prop] === `boolean` ? `checked` : `value`] =
      storage.hitFinder[prop];
  }
});

$(`#hit-info-modal`).on(`show.bs.modal`, (event) => {
  const key = event.relatedTarget.dataset.key;
  const hit = finderDB[key];

  document.getElementById(`hit-info-title`).textContent = hit.title;
  document.getElementById(`hit-info-requester`).textContent = `${hit.requester_name} [${hit.requester_id}]`;
  document.getElementById(`hit-info-reward`).textContent = toMoneyString(hit.monetary_reward.amount_in_dollars);
  document.getElementById(`hit-info-duration`).textContent = toDurationString(hit.assignment_duration_in_seconds);
  document.getElementById(`hit-info-available`).textContent = hit.assignable_hits_count;
  document.getElementById(`hit-info-description`).textContent = hit.description;
  document.getElementById(`hit-info-requirements`).textContent =
    hit.project_requirements
      .map((o) =>
        `${o.qualification_type.name} ${o.comparator} ${o.qualification_values.map((v) => v).join(`, `)}`.trim(),
      )
      .join(`; `) || `None`;

  document.getElementById(`hit-info-block-requester`).dataset.key = key;
  document.getElementById(`hit-info-block-requester`).dataset.name = hit.requester_name;
  document.getElementById(`hit-info-block-requester`).dataset.match = hit.requester_id;

  document.getElementById(`hit-info-block-hit`).dataset.key = key;
  document.getElementById(`hit-info-block-hit`).dataset.name = hit.title;
  document.getElementById(`hit-info-block-hit`).dataset.match = hit.hit_set_id;

  document.getElementById(`hit-info-include-requester`).dataset.key = key;
  document.getElementById(`hit-info-include-requester`).dataset.name = hit.requester_name;
  document.getElementById(`hit-info-include-requester`).dataset.match = hit.requester_id;

  document.getElementById(`hit-info-include-hit`).dataset.key = key;
  document.getElementById(`hit-info-include-hit`).dataset.name = hit.title;
  document.getElementById(`hit-info-include-hit`).dataset.match = hit.hit_set_id;
});

$(`#hit-sharer-modal`).on(`show.bs.modal`, (event) => {
  const key = event.relatedTarget.dataset.key;

  for (const element of event.target.getElementsByClassName(`hit-sharer`)) {
    element.dataset.key = key;
  }
});

$(`#requester-review-modal`).on(`show.bs.modal`, async (event) => {
  const rid = event.relatedTarget.dataset.key;

  const tv = turkerviewDB[rid];
  const { turkopticon: to, turkopticon2: to2 } = turkopticonDB[rid] || {};

  const options = await StorageGetKey(`options`);

  if (options.turkerview) {
    if (tv && tv.ratings) {
      document.getElementById(`review-who`).textContent = tv.requester_name;
      document.getElementById(`review-turkerview-link`).href = `https://turkerview.com/requesters/${rid}`;
      document.getElementById(
        `review-turkerview-link`,
      ).innerHTML = `TurkerView (${tv.reviews.toLocaleString()} Reviews)`;
      document.getElementById(`review-turkerview-ratings-hourly`).innerHTML = `<strong class="pull-right text-${
        tv.wages.average.class
      }">${toMoneyString(tv.wages.average.wage)}/hr</strong>`;
      document.getElementById(`review-turkerview-ratings-pay`).innerHTML =
        `<span class="pull-right text-${tv.ratings.pay.class}">${tv.ratings.pay.text} <i class="fa ${
          tv.ratings.pay.faicon
        }"></i></span>` || `-`;
      document.getElementById(`review-turkerview-ratings-fast`).innerHTML =
        `<span class="pull-right text-${tv.ratings.fast.class}">${tv.ratings.fast.text}</span>` || `-`;
      document.getElementById(`review-turkerview-ratings-comm`).innerHTML =
        `<span class="pull-right text-${tv.ratings.comm.class}">${tv.ratings.comm.text}</span>` || `-`;
      document.getElementById(`review-turkerview-rejections`).innerHTML =
        tv.rejections === 0
          ? `<i class="fa fa-check text-success"></i> No Rejections`
          : `<i class="fa fa-times text-danger"></i> <a href="https://turkerview.com/requesters/${rid}/reviews/rejected/" target="_blank">Rejected Work</a>`;
      document.getElementById(`review-turkerview-reviews`).textContent = tv.reviews.toLocaleString();
      document.getElementById(`review-turkerview-blocks`).innerHTML =
        tv.blocks === 0
          ? `<i class="fa fa-check text-success"></i> No Blocks`
          : `<i class="fa fa-times text-danger"></i> Blocks Reported`;

      document.getElementById(
        `review-turkerview-profile-link`,
      ).innerHTML = `<a href="https://turkerview.com/requesters/${rid}" target="_blank">Profile <i class="fa fa-external-link"></i></a>`;
      document.getElementById(
        `review-turkerview-reviews-link`,
      ).innerHTML = `<a href="https://turkerview.com/requesters/${rid}/reviews" target="_blank">Reviews <i class="fa fa-external-link"></i></a>`;

      document.getElementById(`review-turkerview-review`).style.display = ``;
      document.getElementById(`review-turkerview-no-reviews`).style.display = `none`;

      document.getElementById(
        `review-turkerview-user-title`,
      ).innerHTML = `Your Reviews (${tv.user_reviews.toLocaleString()} Reviews)`;

      document.getElementById(`tv-user-div`).innerHTML = `
      <div class="row" style="display: ${tv.user_reviews === 0 ? `none` : ``};">
          <div class="col"><p style="margin-bottom: 0.15rem;" class="text-muted"><strong>Hourly Avg:</strong></p></div>
          <div class="col"><p style="margin-bottom: 0.15rem;" class="text-muted pull-right"><strong class="${requesterHourlyTVClass(
            tv.wages.user_average.wage,
          )}">$${tv.wages.user_average.wage}/hr</strong></p></div>
        </div>
      <span class="text-muted" style="display: ${
        tv.user_reviews > 0 ? `none` : `block`
      }; text-align: center; margin-top: 3px;">You don't have any data for this Requester!
        <div style="text-align: center; font-size: 0.714rem;">
          <a class="text-success" href="https://turkerview.com/review.php" target="_blank">How Do I Review on TV?</a>
        </div>
      </span>`;
    } else {
      document.getElementById(`review-turkerview-link`).href = `https://turkerview.com/requesters/${rid}`;
      document.getElementById(`review-turkerview-link`).innerHTML = `TurkerView`;
      document.getElementById(`review-turkerview-review`).style.display = `none`;
      document.getElementById(`review-turkerview-no-reviews`).style.display = ``;
      document.getElementById(`review-turkerview-user-title`).innerHTML = `Your Reviews`;
      document.getElementById(`tv-user-div`).innerHTML = ``;
    }
    document.getElementById(`review-turkerview`).style.display = ``;
  } else {
    document.getElementById(`review-turkerview`).style.display = `none`;
  }

  if (options.turkopticon) {
    if (to) {
      document.getElementById(`review-turkopticon-link`).href = `https://turkopticon.ucsd.edu/${rid}`;
      document.getElementById(`review-turkopticon-attrs-pay`).textContent = `${to.attrs.pay} / 5` || `- / 5`;
      document.getElementById(`review-turkopticon-attrs-fast`).textContent = `${to.attrs.fast} / 5` || `- / 5`;
      document.getElementById(`review-turkopticon-attrs-comm`).textContent = `${to.attrs.comm} / 5` || `- / 5`;
      document.getElementById(`review-turkopticon-attrs-fair`).textContent = `${to.attrs.fair} / 5` || `- / 5`;
      document.getElementById(`review-turkopticon-reviews`).textContent = to.reviews;
      document.getElementById(`review-turkopticon-tos_flags`).textContent = to.tos_flags;

      document.getElementById(`review-turkopticon-review`).style.display = ``;
      document.getElementById(`review-turkopticon-no-reviews`).style.display = `none`;
    } else {
      document.getElementById(`review-turkopticon-review`).style.display = `none`;
      document.getElementById(`review-turkopticon-no-reviews`).style.display = ``;
    }
    document.getElementById(`review-turkopticon`).style.display = ``;
  } else {
    document.getElementById(`review-turkopticon`).style.display = `none`;
  }

  if (options.turkopticon) {
    if (to2) {
      const { all, recent } = to2;

      document.getElementById(`review-turkopticon2-link`).href = `https://turkopticon.info/requesters/${rid}`;
      document.getElementById(`review-turkopticon2-recent-reward`).textContent = recent.hourly;
      document.getElementById(`review-turkopticon2-recent-pending`).textContent = recent.pending;
      document.getElementById(`review-turkopticon2-recent-comm`).textContent = recent.comm;
      document.getElementById(`review-turkopticon2-recent-recommend`).textContent = recent.recommend;
      document.getElementById(`review-turkopticon2-recent-rejected`).textContent = recent.rejected;
      document.getElementById(`review-turkopticon2-recent-tos`).textContent = recent.tos;
      document.getElementById(`review-turkopticon2-recent-broken`).textContent = recent.broken;

      document.getElementById(`review-turkopticon2-all-reward`).textContent = all.hourly;
      document.getElementById(`review-turkopticon2-all-pending`).textContent = all.pending;
      document.getElementById(`review-turkopticon2-all-comm`).textContent = all.comm;
      document.getElementById(`review-turkopticon2-all-recommend`).textContent = all.recommend;
      document.getElementById(`review-turkopticon2-all-rejected`).textContent = all.rejected;
      document.getElementById(`review-turkopticon2-all-tos`).textContent = all.tos;
      document.getElementById(`review-turkopticon2-all-broken`).textContent = all.broken;

      document.getElementById(`review-turkopticon2-review`).style.display = ``;
      document.getElementById(`review-turkopticon2-no-reviews`).style.display = `none`;
    } else {
      document.getElementById(`review-turkopticon2-review`).style.display = `none`;
      document.getElementById(`review-turkopticon2-no-reviews`).style.display = ``;
    }
  } else {
    document.getElementById(`review-turkopticon2`).style.display = `none`;
  }
});

$(document).on(`close.bs.alert`, `#alarm-alert`, (event) => {
  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
  }

  alarm = false;
  alarmRunning = false;
});

document.getElementById(`find`).addEventListener(`click`, finderToggle);

document.getElementById(`speed`).addEventListener(`change`, (event) => {
  storage.hitFinder.speed = event.target.value;

  chrome.storage.local.set({
    finder: storage.hitFinder,
  });
});

document.getElementById(`block-list-delete`).addEventListener(`click`, (event) => {
  const result = window.confirm(`Are you sure you delete your entire Block List?`);

  if (result) {
    storage.blockList = {};
    blockListUpdate();
  }
});

document.getElementById(`block-list-export`).addEventListener(`click`, (event) => {
  saveToFileJSON(`block-list`, storage.blockList);
});

document.getElementById(`block-list-import`).addEventListener(`change`, async (event) => {
  const json = await loadFromFileJSON(event.target.files[0]);

  for (const key in json) {
    const item = json[key];

    if (item.name.length && item.match.length) {
      storage.blockList[key] = {
        name: item.name,
        match: item.match,
        strict: typeof item.strict === `boolean` ? item.strict : true,
      };
    }
  }

  blockListUpdate();
});

document.getElementById(`block-list-add-save`).addEventListener(`click`, (event) => {
  const name = document.getElementById(`block-list-add-name`).value;
  const match = document.getElementById(`block-list-add-match`).value;

  if (name.length && match.length) {
    storage.blockList[match] = {
      name,
      match,
      strict: document.getElementById(`block-list-add-strict`).checked,
    };

    blockListUpdate();
  }
});

document.getElementById(`block-list-edit-save`).addEventListener(`click`, (event) => {
  const name = document.getElementById(`block-list-edit-name`).value;
  const match = document.getElementById(`block-list-edit-match`).value;

  if (name.length && match.length) {
    storage.blockList[match] = {
      name,
      match,
      strict: document.getElementById(`block-list-edit-strict`).checked,
    };

    blockListUpdate();
  }
});

document.getElementById(`block-list-edit-delete`).addEventListener(`click`, (event) => {
  const key = event.target.dataset.key;
  delete storage.blockList[key];
  blockListUpdate();
});

document.getElementById(`include-list-delete`).addEventListener(`click`, (event) => {
  const result = window.confirm(`Are you sure you delete your entire Include List?`);

  if (result) {
    storage.includeList = {};
    includeListUpdate();
  }
});

document.getElementById(`include-list-import`).addEventListener(`change`, async (event) => {
  const json = await loadFromFileJSON(event.target.files[0]);

  for (const key in json) {
    const item = json[key];

    if (item.name.length && item.match.length) {
      storage.includeList[key] = {
        name: item.name,
        match: item.match,
        strict: typeof item.strict === `boolean` ? item.strict : true,
        sound: typeof item.sound === `boolean` ? item.sound : true,
        alarm: typeof item.alarm === `boolean` ? item.alarm : false,
        pushbullet: typeof item.pushbullet === `boolean` ? item.pushbullet : false,
        notification: typeof item.notification === `boolean` ? item.notification : true,
      };
    }
  }

  includeListUpdate();
});

document.getElementById(`include-list-export`).addEventListener(`click`, (event) => {
  saveToFileJSON(`include-list`, storage.includeList);
});

document.getElementById(`include-list-add-save`).addEventListener(`click`, (event) => {
  const name = document.getElementById(`include-list-add-name`).value;
  const match = document.getElementById(`include-list-add-match`).value;

  if (name.length && match.length) {
    storage.includeList[match] = {
      name,
      match,
      strict: document.getElementById(`include-list-add-strict`).checked,
      sound: document.getElementById(`include-list-add-sound`).checked,
      alarm: document.getElementById(`include-list-add-alarm`).checked,
      notification: document.getElementById(`include-list-add-notification`).checked,
      pushbullet: document.getElementById(`include-list-add-pushbullet`).checked,
    };

    includeListUpdate();
  }
});

document.getElementById(`include-list-edit-save`).addEventListener(`click`, (event) => {
  const name = document.getElementById(`include-list-edit-name`).value;
  const match = document.getElementById(`include-list-edit-match`).value;

  if (name.length && match.length) {
    storage.includeList[match] = {
      name,
      match,
      strict: document.getElementById(`include-list-edit-strict`).checked,
      sound: document.getElementById(`include-list-edit-sound`).checked,
      alarm: document.getElementById(`include-list-edit-alarm`).checked,
      notification: document.getElementById(`include-list-edit-notification`).checked,
      pushbullet: document.getElementById(`include-list-edit-pushbullet`).checked,
    };

    includeListUpdate();
  }
});

document.getElementById(`include-list-edit-delete`).addEventListener(`click`, (event) => {
  const key = event.target.dataset.key;
  delete storage.includeList[key];
  includeListUpdate();
});

document.getElementById(`settings-apply`).addEventListener(`click`, finderApply);

document.getElementById(`alarm-on`).addEventListener(`click`, (event) => {
  if (!alarm) {
    alarm = true;

    const alert = document.createElement(`div`);
    alert.id = `alarm-alert`;
    alert.className = `alert alert-info alert-dismissible fade show`;

    const message = document.createElement(`strong`);
    message.textContent = `Alarm is active!`;
    alert.appendChild(message);

    const close = document.createElement(`button`);
    close.type = `button`;
    close.className = `close`;
    close.textContent = `×`;
    close.dataset.dismiss = `alert`;
    alert.appendChild(close);

    document.body.prepend(alert);
  }
});

document.getElementById(`include-hits-clear`).addEventListener(`click`, (event) => {
  document.getElementById(`include-list-hits-card`).style.display = `none`;
  removeChildren(document.getElementById(`include-list-hits-tbody`));
});

document.getElementById(`recent-hits-toggle`).addEventListener(`click`, (event) => {
  const classList = document.getElementById(`recent-hits-toggle`).firstElementChild.classList;
  classList.toggle(`fa-caret-up`);
  classList.toggle(`fa-caret-down`);

  const element = document.getElementById(`recent-hits-card`).getElementsByClassName(`card-block`)[0];
  element.style.display = element.style.display === `none` ? `` : `none`;
});

document.getElementById(`logged-hits-toggle`).addEventListener(`click`, (event) => {
  const classList = document.getElementById(`logged-hits-toggle`).firstElementChild.classList;
  classList.toggle(`fa-caret-up`);
  classList.toggle(`fa-caret-down`);

  const element = document.getElementById(`logged-hits-card`).getElementsByClassName(`card-block`)[0];
  element.style.display = element.style.display === `none` ? `` : `none`;
});

document.getElementById(`hit-export-short`).addEventListener(`click`, (event) => {
  const key = event.target.dataset.key;
  const hit = finderDB[key];
  chrome.runtime.sendMessage({ hit, hitExporter: `short` });
});

document.getElementById(`hit-export-plain`).addEventListener(`click`, (event) => {
  const key = event.target.dataset.key;
  const hit = finderDB[key];
  chrome.runtime.sendMessage({ hit, hitExporter: `plain` });
});

document.getElementById(`hit-export-bbcode`).addEventListener(`click`, (event) => {
  const key = event.target.dataset.key;
  const hit = finderDB[key];
  chrome.runtime.sendMessage({ hit, hitExporter: `bbcode` });
});

document.getElementById(`hit-export-markdown`).addEventListener(`click`, (event) => {
  const key = event.target.dataset.key;
  const hit = finderDB[key];
  chrome.runtime.sendMessage({ hit, hitExporter: `markdown` });
});

document.getElementById(`hit-export-turkerhub`).addEventListener(`click`, (event) => {
  const result = window.prompt(`Are you sure you want to export this HIT to Forum.TurkerView.com?`);

  if (result !== null) {
    const key = event.target.dataset.key;
    const hit = finderDB[key];
    chrome.runtime.sendMessage({ hit, hitExporter: `turkerhub`, message: result }, (response) => {
      /* mark as exported eventually */
    });
  }
});

document.getElementById(`hit-export-mturkcrowd`).addEventListener(`click`, (event) => {
  const result = window.prompt(`Are you sure you want to export this HIT to MTurkCrowd.com?`);

  if (result !== null) {
    const key = event.target.dataset.key;
    const hit = finderDB[key];
    chrome.runtime.sendMessage({ hit, hitExporter: `mturkcrowd`, message: result }, (response) => {
      /* mark as exported eventually */
    });
  }
});
