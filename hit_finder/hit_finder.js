/*
requester review modal redesign for md breakpoint
change hit export buttons to behave like on Worker
*/

Object.assign(String.prototype, {

    toMoneyString() {
        return `$${Number(this).toFixed(2).toLocaleString(`en-US`, { minimumFractionDigits: 2 })}`;
    }
});

Object.assign(Number.prototype, {
    toMoneyString() {
        return `$${this.toFixed(2).toLocaleString(`en-US`, { minimumFractionDigits: 2 })}`;
    },
    toTimeString () {
        let day, hour, minute, seconds = this;
        minute = Math.floor(seconds / 60);
        seconds = seconds % 60;
        hour = Math.floor(minute / 60);
        minute = minute % 60;
        day = Math.floor(hour / 24);
        hour = hour % 24;

        let string = ``;

        if (day > 0) {
            string += `${day} day${day > 1 ? `s` : ``} `;
        }
        if (hour > 0) {
            string += `${hour} hour${hour > 1 ? `s` : ``} `;
        }
        if (minute > 0) {
            string += `${minute} minute${minute > 1 ? `s` : ``}`;
        }
        return string.trim();
    }
});

const paused = new Object(), finderDB = new Object(), reviewsDB = new Object(), includeAlerted = new Array(), includePushbulleted = new Array();

let totalScans = 0, pageRequestErrors = 0;
let alarm = false, alarmAudio = null, alarmRunning = false, finderTimeout = null;

let storage = (async (object) => {
    const items = await new Promise((resolve) => chrome.storage.local.get([`finder`, `blockList`, `includeList`, `reviews`, `theming`], resolve));

    ((hitFinder) => {
        object.finder = hitFinder ? hitFinder : {
            speed: `3000`,
            filter: {
                sort: `updated_desc`,
                page_size: `25`,
                masters: false,
                qualified: false,
                min_reward: `0`,
                min_available: `0`
            },
            notifications: {
                delay: `30`,
                new_sound: `sound_1`,
                included_sound: `voice`,
                pushbullet: {
                    state: `off`,
                    token: ``
                }
            }
        };

        document.getElementById(`finder-speed`).value = object.finder.speed;
    })(items.finder);

    object.blockList = items.blockList instanceof Object ? ((blockList) => {
        const localStorageBlockList = localStorage.getItem(`BLOCK_LIST`);

        if (localStorageBlockList) {
            try {
                const json = JSON.parse(localStorageBlockList);

                const confirmImport = confirm(`Found a block list from HIT Finder (Legacy), would you like to import it?\n\nDoing so will delete your HIT Finder (Legacy) block list.`);

                if (confirmImport) {
                    for (const key in json) {
                        const bl = json[key];

                        blockList[key] = {
                            name: bl.name || key,
                            match: key,
                            strict: typeof bl.strict === `boolean` ? bl.strict : true,
                        };
                    }
                    
                    localStorage.removeItem(`BLOCK_LIST`);
                }
                else {
                    const confirmDelete = confirm(`Do you want to delete your HIT Finder (Legacy) block list?\n\nYou will be asked to import every time you load HIT Finder until it is deleted.`);

                    if (confirmDelete) {
                        localStorage.removeItem(`BLOCK_LIST`);
                    }
                }
            }
            catch (error) {
                alert(`Error while importing block list\n\n${error}`);
            }
        }

        for (const key in items.blockList) {
            const bl = items.blockList[key];

            if (bl.match) {
                blockList[bl.match] = {
                    name: bl.name || bl.match,
                    match: bl.match,
                    strict: typeof bl.strict === `boolean` ? bl.strict : true,
                };
            }
            else if (bl.term) {
                blockList[bl.term] = {
                    name: bl.name || bl.term,
                    match: bl.term,
                    strict: typeof bl.strict === `boolean` ? bl.strict : true,
                };
            }
        }

        return blockList;
    })(new Object()) : new Object();

    object.includeList = items.includeList instanceof Object ? ((includeList) => {
        const localStorageIncludeList = localStorage.getItem(`INCLUDE_LIST`);

        if (localStorageIncludeList) {
            try {
                const json = JSON.parse(localStorageIncludeList);

                const confirmImport = confirm(`Found an include list from HIT Finder (Legacy), would you like to import it?\n\nDoing so will delete your HIT Finder (Legacy) include list.`);

                if (confirmImport) {
                    for (const key in json) {
                        const il = json[key];

                        if (il.match) {
                            includeList[il.match] = {
                                name: il.name || il.match,
                                match: il.match,
                                strict: typeof il.strict === `boolean` ? il.strict : true,
                                sound: typeof il.sound === `boolean` ? il.sound : true,
                                alarm: typeof il.alarm === `boolean` ? il.alarm : false,
                                pushbullet: typeof il.pushbullet === `boolean` ? il.pushbullet : false,
                                notification: typeof il.notification === `boolean` ? il.notification : true
                            };
                        }
                        else if (il.term) {
                            includeList[il.term] = {
                                name: il.name || il.term,
                                match: il.term,
                                strict: typeof il.strict === `boolean` ? il.strict : true,
                                sound: typeof il.sound === `boolean` ? il.sound : true,
                                alarm: typeof il.alarm === `boolean` ? il.alarm : false,
                                pushbullet: typeof il.pushbullet === `boolean` ? il.pushbullet : false,
                                notification: typeof il.notification === `boolean` ? il.notification : true
                            };
                        }

                        localStorage.removeItem(`INCLUDE_LIST`);
                    }
                }
                else {
                    const confirmDelete = confirm(`Do you want to delete your HIT Finder (Legacy) include list?\n\nYou will be asked to import every time you load HIT Finder until it is deleted.`);

                    if (confirmDelete) {
                        localStorage.removeItem(`INCLUDE_LIST`);
                    }
                }
            }
            catch (error) {
                alert(`Error while importing include list\n\n${error}`);
            }
        }

        for (const key in items.includeList) {
            const il = items.includeList[key];

            if (il.match) {
                includeList[il.match] = {
                    name: il.name || il.match,
                    match: il.match,
                    strict: typeof il.strict === `boolean` ? il.strict : true,
                    sound: typeof il.sound === `boolean` ? il.sound : true,
                    alarm: typeof il.alarm === `boolean` ? il.alarm : false,
                    pushbullet: typeof il.pushbullet === `boolean` ? il.pushbullet : false,
                    notification: typeof il.notification === `boolean` ? il.notification : true
                };
            }
            else if (il.term) {
                includeList[il.term] = {
                    name: il.name || il.term,
                    match: il.term,
                    strict: typeof il.strict === `boolean` ? il.strict : true,
                    sound: typeof il.sound === `boolean` ? il.sound : true,
                    alarm: typeof il.alarm === `boolean` ? il.alarm : false,
                    pushbullet: typeof il.pushbullet === `boolean` ? il.pushbullet : false,
                    notification: typeof il.notification === `boolean` ? il.notification : true
                };
            }
        }

        return includeList;
    })(new Object()) : new Object();

    object.reviews = items.reviews instanceof Object ? items.reviews : new Object();

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.reviews) {
            storage.reviews = changes.reviews.newValue;
            updateRequesterReviews(reviewsDB);
        }
        if (changes.theming) {
            storage.theming = changes.theming.newValue;

        }
    });

    return storage = object;
})(new Object());

document.getElementById(`find`).addEventListener(`click`, (event) => {
    if (event.target.classList.contains(`btn-outline-success`)) {
        event.target.classList.replace(`btn-outline-success`, `btn-success`);
        finderRun();
    }
    else {
        event.target.classList.replace(`btn-success`, `btn-outline-success`);
    }
});

async function finderRun() {
    clearTimeout(finderTimeout);

    if (document.getElementById(`find`).classList.contains(`btn-outline-success`)) {
        return;
    }

    const start = new Date().getTime();

    function delay() {
        const nextCatch = start + Number(storage.finder.speed);
        const adjustedDelay = nextCatch - new Date().getTime();
        return adjustedDelay > 0 ? adjustedDelay : 1;
    }

    const url = new URL(`https://worker.mturk.com/`);
    const params = {
        sort: storage.finder.filter.sort,
        page_size: storage.finder.filter.page_size,
        'filters[masters]': storage.finder.filter.masters,
        'filters[qualified]': storage.finder.filter.qualified,
        'filters[min_reward]': storage.finder.filter.min_reward,
        format: `json`
    };
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

    try {
        const response = await fetch(url, {
            credentials: `include`
        });

        if (response.url.indexOf(`https://worker.mturk.com`) === -1) {
            return finderLoggedOut();
        }
        else if (response.ok) {
            finderProcess(await response.json());
        }
        else if (response.status === 429) {
            document.getElementById(`page-request-errors`).textContent = ++ pageRequestErrors;
        }
        
        document.getElementById(`total-scans`).textContent = ++ totalScans;
        finderTimeout = setTimeout(finderRun, delay());
    }
    catch (error) {
        finderTimeout = setTimeout(finderRun, delay());
    }
}

function finderProcess(json) {
    let sound = false, blocked = 0;

    const requester_ids = [...new Set(json.results.map((o) => o.requester_id))];
    requesterReviewsCheck(requester_ids);

    const found = document.getElementById(`found`);

    while (found.firstChild) {
        found.removeChild(found.firstChild);
    }

    for (const hit of json.results) {
        if (blockListed(hit) || hit.assignable_hits_count < Number(storage.finder.filter.min_available)) {
            blocked ++;
            continue;
        }

        const included = includeListed(hit);

        const row = document.createElement(`tr`);

        if (included && !includeAlerted.includes(hit.hit_set_id)) {
            includedAlert(included, hit);

            row.className = `included`;

            const el = row.cloneNode(true);
            el.appendChild(createHitRow(hit, [`remove`, `requester`, `title`, `time`, `reward`, `masters`]));

            const includedId = document.getElementById(`included`);
            const includedCard = document.getElementById(`included-card`);

            includedId.insertBefore(el, includedId.firstChild);
            includedCard.style.display = ``;
        }

        if (finderDB[hit.hit_set_id] === undefined) {
            sound = true;
            finderDB[hit.hit_set_id] = hit;

            const el = row.cloneNode(true);
            el.id = hit.hit_set_id;
            el.appendChild(createHitRow(hit, [`share`, `requester`, `title`, `time`, `reward`, `masters`]));

            document.getElementById(`logged`).insertBefore(el, document.getElementById(`logged`).firstChild);
        }

        row.appendChild(createHitRow(hit, [`share`, `requester`, `title`, `available`, `reward`, `reviews`, `masters`]));
        document.getElementById(`found`).appendChild(row);
    }

    if (sound && storage.finder.notifications.new_sound !== `none`) {
        const audio = new Audio();
        audio.src = `/media/audio/${storage.finder.notifications.new_sound}.ogg`;
        audio.play();
    }

    document.getElementById(`hits-found`).textContent = `Found: ${json.num_results} | Blocked: ${blocked} | ${new Date().toLocaleTimeString()}`;
    document.getElementById(`hits-logged`).textContent = document.getElementById(`logged`).children.length;
}

function createHitRow(hit, elements) {
    const fragment = document.createDocumentFragment();

    if (elements.includes(`share`)) {
        const actions = document.createElement(`td`);
        actions.style.width = `20px`;
        fragment.appendChild(actions);

        const group = document.createElement(`div`);
        group.className = `btn-group`;
        group.setAttribute(`role`, `group`);
        actions.appendChild(group);

        const info = document.createElement(`button`);
        info.type = `button`;
        info.className = `btn btn-xs btn-primary glyphicon glyphicon-cog`;
        info.addEventListener(`click`, (event) => hitInfoModal(hit));
        group.appendChild(info);

        const share = document.createElement(`button`);
        share.type = `button`;
        share.className = `btn btn-xs btn-primary glyphicon glyphicon-share-alt`;
        share.addEventListener(`click`, (e) => hitExportModal(hit));
        group.appendChild(share);
    }

    if (elements.includes(`remove`)) {
        const actions = document.createElement(`td`);
        actions.style.width = `20px`;
        fragment.appendChild(actions);

        const group = document.createElement(`div`);
        group.className = `btn-group`;
        group.setAttribute(`role`, `group`);
        actions.appendChild(group);

        const remove = document.createElement(`button`);
        remove.type = `button`;
        remove.className = `btn btn-xs btn-danger glyphicon glyphicon-minus`;
        remove.addEventListener(`click`, (event) => {
            const elemment = event.target.closest(`.included`);
            elemment.parentNode.removeChild(elemment);
        });
        group.appendChild(remove);

        const info = document.createElement(`button`);
        info.type = `button`;
        info.className = `btn btn-xs btn-primary glyphicon glyphicon-cog`;
        info.addEventListener(`click`, (event) => hitInfoModal(hit));
        group.appendChild(info);
    }

    if (elements.includes(`requester`)) {
        const requester = document.createElement(`td`);
        fragment.appendChild(requester);

        const requesterContainer = document.createElement(`div`);
        requesterContainer.className = `btn-group`;
        requester.appendChild(requesterContainer);

        if (true) {
            const reviewClass = reviewsDB[hit.requester_id] ? requesterReviewGetClass(reviewsDB[hit.requester_id]) : ``;

            const reviewsIcon = document.createElement(`button`);
            reviewsIcon.className = `btn btn-xs glyphicon glyphicon-user ${hit.requester_id} ${reviewClass} mr-1`;
            reviewsIcon.addEventListener(`click`, (event) => {
                reviewModal(hit.requester_id); 
            });
            requesterContainer.appendChild(reviewsIcon);
        }

        const requesterLink = document.createElement(`a`);
        requesterLink.href = `https://worker.mturk.com/requesters/${hit.requester_id}/projects`;
        requesterLink.target = `_blank`;
        requesterLink.textContent = hit.requester_name;
        requesterContainer.appendChild(requesterLink);
    }

    if (elements.includes(`title`)) {
        const title = document.createElement(`td`);
        fragment.appendChild(title);

        const titleLink = document.createElement(`a`);
        titleLink.href = `https://worker.mturk.com/projects/${hit.hit_set_id}/tasks`;
        titleLink.target = `_blank`;
        titleLink.textContent = hit.title;
        title.appendChild(titleLink);
    }

    if (elements.includes(`time`)) {
        const time = document.createElement(`td`);
        time.className = `text-center`;
        time.textContent = timeNow();
        fragment.appendChild(time);
    }

    if (elements.includes(`available`)) {
        const available = document.createElement(`td`);
        available.className = `text-center`;
        available.textContent = hit.assignable_hits_count;
        fragment.appendChild(available);
    }

    if (elements.includes(`reward`)) {
        const reward = document.createElement(`td`);
        reward.className = `text-center`;
        fragment.appendChild(reward);

        const rewardLink = document.createElement(`a`);
        rewardLink.href = `https://worker.mturk.com/projects/${hit.hit_set_id}/tasks/accept_random`;
        rewardLink.target = `_blank`;
        rewardLink.textContent = hit.monetary_reward.amount_in_dollars.toMoneyString();
        reward.appendChild(rewardLink);
    }

    if (elements.includes(`masters`)) {
        const masters = document.createElement(`td`);
        masters.className = `text-center`;
        masters.textContent = hit.project_requirements.filter((o) => [`2F1QJWKUDD8XADTFD2Q0G6UTO95ALH`, `2NDP2L92HECWY8NS8H3CK0CP5L9GHO`, `21VZU98JHSTLZ5BPP4A9NOBJEK3DPG`].includes(o.qualification_type_id)).length > 0 ? `Y` : `N`;
        fragment.appendChild(masters);
    }

    return fragment;
}

function finderLoggedOut() {
    textToSpeech(`Attention, you are logged out of MTurk.`);
}

function blockListed (hit) {
    for (const match in storage.blockList) {
        const bl = storage.blockList[match];
        if (bl.strict) {
            const compared = strictCompare(match, [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title]);
            if (compared === true) {
                return true;
            }
        }
        else {
            const compared = looseCompare(match, [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title]);
            if (compared === true) {
                return true;
            }
        }
    }
    return false;
}

function includeListed (hit) {
    for (const match in storage.includeList) {
        const il = storage.includeList[match];
        if (il.strict) {
            const compared = strictCompare(match, [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title]);
            if (compared === true) {
                return il;
            }
        }
        else {
            const compared = looseCompare(match, [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title]);
            if (compared === true) {
                return il;
            }
        }
    }
    return false;	
}

function includedAlert (il, hit) {
    const alerted = includeAlerted.includes(hit.hit_set_id);
    const pushbulleted = includePushbulleted.includes(hit.hit_set_id);

    if (alarm && il.alarm === true) {
        alarmSound();
    }

    if (alerted) {
        return;
    }

    if (il.sound === true) {
        if (storage.finder.notifications.included_sound === `voice`) {
            textToSpeech(`Include list match found! ${il.name}`);
        }
        else {
            const audio = new Audio();
            audio.src = `/media/audio/${storage.finder.notifications.included_sound}.ogg`;
            audio.play();
        }
    }

    if (il.notification) {
        chrome.notifications.create(
            hit.hit_set_id, 
            {
                type: `list`,
                title: `Include list match found!`,
                message: `Match`,
                iconUrl: `/media/icon_128.png`,
                items: [
                    { title: `Title`, message: hit.title },
                    { title: `Requester`, message: hit.requester_name },
                    { title: `Reward`, message: hit.monetary_reward.amount_in_dollars.toMoneyString() },
                    { title: `Available`, message: hit.assignable_hits_count.toString() }
                ],
                buttons: [
                    { title: `Preview` },
                    { title: `Accept` }
                ]
            }, 
            (id) => {
                setTimeout(() => {
                    chrome.notifications.clear(id);
                }, 15000);
            }
        );
    }

    if (il.pushbullet && storage.finder.notifications.pushbullet.state === `on` && pushbulleted === false) {
        $.ajax({
            type: `POST`,
            url: `https://api.pushbullet.com/v2/pushes`,
            headers: {
                Authorization: `Bearer ${storage.finder.notifications.pushbullet.token}`
            },
            data: {
                type: `note`,
                title: `Include list match found!`,
                body: `Title: ${hit.title}\nReq: ${hit.requester_name}\nReward: ${hit.monetary_reward.amount_in_dollars.toMoneyString()}\nAvail: ${hit.assignable_hits_count}`
            }
        });

        includePushbulleted.unshift(hit.hit_set_id);

        setTimeout(() => {
            includePushbulleted.pop();
        }, 900000);
    }


    includeAlerted.unshift(hit.hit_set_id);

    setTimeout(() => {
        includeAlerted.pop();
    }, Number(storage.finder.notifications.delay) * 60000);
}

function strictCompare (string, array) {
    for (const value of array) {
        if (string === value) {
            return true;
        }
    }
    return false;
}

function looseCompare (string, array) {
    for (const value of array) {
        if (value.toLowerCase().indexOf(string.toLowerCase()) !== -1) {
            return true;
        }
    }
    return false;
}

$(document).on(`click`, `#alarm-on`, e => alarmOn());

$(document).on(`click`, `#alarm-off`, e => alarmOff());

$(`#alarm-modal`).on(`hide.bs.modal`, e => alarmOff());

function alarmOn () {
    $(`.modal`).modal(`hide`);
    $(`#alarm-modal`).modal(`show`);

    alarm = true;
}

function alarmOff () {
    if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio.currentTime = 0; 
    }

    alarm = false;
    alarmRunning = false;
}

function alarmSound () {
    if (!alarm || alarmRunning) {
        return;
    }

    alarmAudio = new Audio();
    alarmAudio.src = `/media/audio/alarm.ogg`;
    alarmAudio.loop = true;
    alarmAudio.play();

    alarmRunning = true;
}

function hitExportModal(hit) {
    document.getElementById(`hit-export-info`).textContent = `${hit.requester_name} - ${hit.title}`;

    const modal = document.getElementById(`hit-export-modal`);
    const short = document.getElementById(`hit-export-short`);
    const plain = document.getElementById(`hit-export-plain`);
    const bbcode = document.getElementById(`hit-export-bbcode`);
    const markdown = document.getElementById(`hit-export-markdown`);
    const turkerhub = document.getElementById(`hit-export-turkerhub`);
    const mturkcrowd = document.getElementById(`hit-export-mturkcrowd`);

    function shortEvent() {
        chrome.runtime.sendMessage({ function: `hitExportShort`, arguments: { hit: hit } });
    }

    function plainEvent() {
        chrome.runtime.sendMessage({ function: `hitExportPlain`, arguments: { hit: hit } });
    }

    function bbcodeEvent() {
        chrome.runtime.sendMessage({ function: `hitExportBBCode`, arguments: { hit: hit } });
    }

    function markdownEvent() {
        chrome.runtime.sendMessage({ function: `hitExportMarkdown`, arguments: { hit: hit } });
    }

    function turkerhubEvent() {
        if (confirm(`Are you sure you want to export this HIT to TurkerHub.com?`)) {
            chrome.runtime.sendMessage({ function: `hitExportTurkerHub`, arguments: { hit: hit } });
        }
    }

    function mturkcrowdEvent() {
        if (confirm(`Are you sure you want to export this HIT to MTurkCrowd.com?`)) {
            chrome.runtime.sendMessage({ function: `hitExportMTurkCrowd`, arguments: { hit: hit } });
        }
    }

    short.addEventListener(`click`, shortEvent);
    plain.addEventListener(`click`, plainEvent);
    bbcode.addEventListener(`click`, bbcodeEvent);
    markdown.addEventListener(`click`, markdownEvent);
    turkerhub.addEventListener(`click`, turkerhubEvent);
    mturkcrowd.addEventListener(`click`, mturkcrowdEvent);

    $(modal).modal(`show`).on(`hidden.bs.modal`, (event) => {
        short.removeEventListener(`click`, shortEvent);
        plain.removeEventListener(`click`, plainEvent);
        bbcode.removeEventListener(`click`, bbcodeEvent);
        markdown.removeEventListener(`click`, markdownEvent);
        turkerhub.removeEventListener(`click`, turkerhubEvent);
        mturkcrowd.removeEventListener(`click`, mturkcrowdEvent);
        $(modal).off();
    });
}

function hitInfoModal(hit) {
    document.getElementById(`hit-info-title`).textContent = hit.title;
    document.getElementById(`hit-info-requester`).textContent = `${hit.requester_name} [${hit.requester_id}]`;
    document.getElementById(`hit-info-reward`).textContent = hit.monetary_reward.amount_in_dollars.toMoneyString();
    document.getElementById(`hit-info-duration`).textContent = hit.assignment_duration_in_seconds.toTimeString();
    document.getElementById(`hit-info-available`).textContent = hit.assignable_hits_count;
    document.getElementById(`hit-info-description`).textContent = hit.description;
    document.getElementById(`hit-info-requirements`).textContent = hit.project_requirements.map(o => `${o.qualification_type.name} ${o.comparator} ${o.qualification_values.map(v => v).join(`, `)}`.trim()).join(`; `) || `None`;

    const modal = document.getElementById(`hit-info-modal`);
    const blockRequester = document.getElementById(`hit-info-block-requester`);
    const blockHit = document.getElementById(`hit-info-block-hit`);
    const includeRequester = document.getElementById(`hit-info-include-requester`);
    const includeHit = document.getElementById(`hit-info-include-hit`);

    function blockRequesterEvent() {
        blockListAddModal({ name: hit.requester_name, match: hit.requester_id });
    }

    function blockHitEvent() {
        blockListAddModal({ name: hit.title, match: hit.hit_set_id });
    }

    function includeRequesterEvent() {
        includeListAddModal({ name: hit.requester_name, match: hit.requester_id });
    }

    function includeHitEvent() {
        includeListAddModal({ name: hit.title, match: hit.hit_set_id });
    }

    blockRequester.addEventListener(`click`, blockRequesterEvent);
    blockHit.addEventListener(`click`, blockHitEvent);
    includeRequester.addEventListener(`click`, includeRequesterEvent);
    includeHit.addEventListener(`click`, includeHitEvent);

    $(modal).modal(`show`).on(`hidden.bs.modal`, (event) => {
        blockRequester.removeEventListener(`click`, blockRequesterEvent);
        blockHit.removeEventListener(`click`, blockHitEvent);
        includeRequester.removeEventListener(`click`, includeRequesterEvent);
        includeHit.removeEventListener(`click`, includeHitEvent);
        $(modal).off();
    });
}

document.getElementById(`blockListModal`).addEventListener(`click`, blockListModal);
document.getElementById(`blockListImport`).addEventListener(`click`, blockListImport);
document.getElementById(`blockListExport`).addEventListener(`click`, blockListExport);
document.getElementById(`blockListAddModal`).addEventListener(`click`, blockListAddModal);

function blockListModal() {
    blockListUpdate();

    const modal = document.getElementById(`block-list-modal`);
    $(modal).modal(`show`);
}

function blockListImport(json) {
    const importBlockList = prompt(`Please enter your block list here.`, ``);

    if (importBlockList) {
        try {
            const json = JSON.parse(importBlockList);

            for (const key in json) {
                const bl = json[key];

                storage.blockList[key] = {
                    name: bl.name || key,
                    match: key,
                    strict: typeof bl.strict === `boolean` ? bl.strict : true,
                };
            }

            blockListUpdate();
        }
        catch (error) {
            alert(`An error occured while importing.\n\n${error}`);
        }
    }
}

function blockListExport() {
    try {
        const string = JSON.stringify(storage.blockList);
        const copy = toClipBoard(string);

        alert(copy ? `Block list export has been copied to your clipboard.` : string);
    }
    catch (error) {
        alert(`An error occured while exporting.\n\n${error}`);
    }
}

function blockListAddModal(bl) {
    const addModal = document.getElementById(`block-list-add-modal`);
    const addName = document.getElementById(`block-list-add-name`);
    const addMatch = document.getElementById(`block-list-add-match`);
    const addStrict = document.getElementById(`block-list-add-strict`);
    const addSave = document.getElementById(`block-list-add-save`);

    function addSaveEvent(event) {
        const infoModal = document.getElementById(`hit-info-modal`);
        $([addModal, infoModal]).modal(`hide`);

        const name = addName.value;
        const match = addMatch.value;
        const strict = addStrict.checked;

        if (match.length > 0) {
            storage.blockList[match] = {
                name: name.length > 0 ? name : match, 
                match: match,
                strict: strict
            };

            blockListUpdate();
        }
    }

    addName.value = bl.name || ``;
    addMatch.value = bl.match || ``;
    addStrict.checked = true;

    addSave.addEventListener(`click`, addSaveEvent);

    $(addModal).modal(`show`).on(`hidden.bs.modal`, (event) => {
        addSave.removeEventListener(`click`, addSaveEvent);
        $(addModal).off();
    });
}

function blockListEditModal(bl) {
    const editModal = document.getElementById(`block-list-edit-modal`);
    const editName = document.getElementById(`block-list-edit-name`);
    const editMatch = document.getElementById(`block-list-edit-match`);
    const editStrict = document.getElementById(`block-list-edit-strict`);
    const editDelete = document.getElementById(`block-list-edit-delete`);
    const editSave = document.getElementById(`block-list-edit-save`);

    function editDeleteEvent(event) {       
        const infoModal = document.getElementById(`hit-info-modal`);
        $([editModal, infoModal]).modal(`hide`);

        delete storage.blockList[bl.match];

        blockListUpdate();
    }

    function editSaveEvent(event) {
        const infoModal = document.getElementById(`hit-info-modal`);
        $([editModal, infoModal]).modal(`hide`);

        const name = editName.value;
        const match = editMatch.value;
        const strict = editStrict.checked;

        if (match.length > 0) {
            storage.blockList[match] = {
                name: name.length > 0 ? name : match, 
                match: match,
                strict: strict
            };

            blockListUpdate();
        }
    }

    editName.value = bl.name;
    editMatch.value = bl.match;
    document.querySelector(`[name="block-list-edit-strict"][value="${bl.strict ? `strict` : `loose`}"]`).checked = true;

    editDelete.addEventListener(`click`, editDeleteEvent);
    editSave.addEventListener(`click`, editSaveEvent);

    $(editModal).modal(`show`).on(`hidden.bs.modal`, (event) => {
        editDelete.removeEventListener(`click`, editDeleteEvent); 
        editSave.removeEventListener(`click`, editSaveEvent);
        $(editModal).off();
    });
}

function blockListUpdate() {
    const sorted = Object.keys(storage.blockList).map((currentValue) => {
        storage.blockList[currentValue].term = currentValue;
        return storage.blockList[currentValue];
    }).sort((a, b) =>  a.name > b.name);

    const body = document.getElementById(`block-list-modal`).getElementsByClassName(`modal-body`)[0];

    while (body.firstChild) {
        body.removeChild(body.firstChild);
    }

    body.appendChild((() => {
        const fragment = document.createDocumentFragment();

        for (const bl of sorted) {            
            const button = document.createElement(`button`);
            button.type = `button`
            button.className = `btn btn-xs btn-danger ml-1 my-1 bl-btn`;
            button.textContent = bl.name;
            button.addEventListener(`click`, (event) => {
                blockListEditModal(bl);
            });
            fragment.appendChild(button);
        }

        return fragment;
    })());

    for (const key in finderDB) {
        const hit = finderDB[key];

        if (blockListed(hit)) {
            const element = document.getElementById(hit.hit_set_id);

            if (element !== null) {
                element.parentNode.removeChild(element);
            }
        }
    }

    chrome.storage.local.set({
        blockList: storage.blockList
    });
}

document.getElementById(`includeListModal`).addEventListener(`click`, includeListModal);
document.getElementById(`includeListImport`).addEventListener(`click`, includeListImport);
document.getElementById(`includeListExport`).addEventListener(`click`, includeListExport);
document.getElementById(`includeListAddModal`).addEventListener(`click`, includeListAddModal);

function includeListModal() {
    includeListUpdate();

    const modal = document.getElementById(`include-list-modal`);
    $(modal).modal(`show`);
}

function includeListImport() {
    const importIncludeList  = prompt(`Please enter your include list here.`,  ``);

    if (importIncludeList) {
        try {
            const json = JSON.parse(importIncludeList);

            for (const key in json) {
                const il = json[key];

                storage.includeList[key] = {
                    name: il.name || key,
                    match: key,
                    strict: typeof il.strict === `boolean` ? il.strict : true,
                    sound: typeof il.sound === `boolean` ? il.sound : true,
                    alarm: typeof il.alarm === `boolean` ? il.alarm : false,
                    pushbullet: typeof il.pushbullet === `boolean` ? il.pushbullet : false,
                    notification: typeof il.notification === `boolean` ? il.notification : true
                };
            }

            includeListUpdate();
        }
        catch (error) {
            alert(`An error occured while importing.\n\n${error}`);
        }
    }
}

function includeListExport() {
    try {
        const string = JSON.stringify(storage.includeList);
        const copy = toClipBoard(string);

        alert(copy ? `Include list export has been copied to your clipboard.` : string);
    }
    catch (error) {
        alert(`An error occured while exporting.\n\n${error}`);
    }
}

function includeListAddModal(il) {
    const addModal = document.getElementById(`include-list-add-modal`);
    const addName = document.getElementById(`include-list-add-name`);
    const addMatch = document.getElementById(`include-list-add-match`);
    const addStrict = document.getElementById(`include-list-add-strict`);
    const addSound = document.getElementById(`include-list-add-sound`);
    const addAlarm = document.getElementById(`include-list-add-alarm`);
    const addNotification = document.getElementById(`include-list-add-notification`);
    const addPushbullet = document.getElementById(`include-list-add-pushbullet`);
    const addSave = document.getElementById(`include-list-add-save`);

    function addSaveEvent(event) {
        const infoModal = document.getElementById(`hit-info-modal`);
        $([addModal, infoModal]).modal(`hide`);

        const name = addName.value;
        const match = addMatch.value;
        const strict = addStrict.checked;
        const sound = addSound.checked;
        const alarm = addAlarm.checked;
        const notification = addNotification.checked;
        const pushbullet = addPushbullet.checked;

        if (match.length > 0) {
            storage.includeList[match] = {
                name: name.length > 0 ? name : match, 
                match: match,
                strict: strict,
                sound: sound,
                alarm: alarm,
                notification: notification,
                pushbullet: pushbullet
            };

            includeListUpdate();
        }
    }

    addName.value = il.name || ``;
    addMatch.value = il.match || ``;
    addStrict.checked = true;
    addSound.checked = true;
    addAlarm.checked = false;
    addNotification.checked = true;
    addPushbullet.checked = false;

    addSave.addEventListener(`click`, addSaveEvent);

    $(addModal).modal(`show`).on(`hidden.bs.modal`, (event) => {
        addSave.removeEventListener(`click`, addSaveEvent);
        $(addModal).off();
    });
}

function includeListEditModal(il) {
    const editModal = document.getElementById(`include-list-edit-modal`);
    const editName = document.getElementById(`include-list-edit-name`);
    const editMatch = document.getElementById(`include-list-edit-match`);
    const editStrict = document.getElementById(`include-list-edit-strict`);
    const editSound = document.getElementById(`include-list-edit-sound`);
    const editAlarm = document.getElementById(`include-list-edit-alarm`);
    const editNotification = document.getElementById(`include-list-edit-notification`);
    const editPushbullet = document.getElementById(`include-list-edit-pushbullet`);
    const editDelete = document.getElementById(`include-list-edit-delete`);
    const editSave = document.getElementById(`include-list-edit-save`);

    function editDeleteEvent(event) {       
        const infoModal = document.getElementById(`hit-info-modal`);
        $([editModal, infoModal]).modal(`hide`);

        delete storage.includeList[il.match];

        includeListUpdate();
    }

    function editSaveEvent(event) {
        const infoModal = document.getElementById(`hit-info-modal`);
        $([editModal, infoModal]).modal(`hide`);

        const name = editName.value;
        const match = editMatch.value;
        const strict = editStrict.checked;
        const sound = editSound.checked;
        const alarm = editAlarm.checked;
        const notification = editNotification.checked;
        const pushbullet = editPushbullet.checked;

        if (match.length > 0) {
            storage.includeList[match] = {
                name: name.length > 0 ? name : match, 
                match: match,
                strict: strict,
                sound: sound,
                alarm: alarm,
                notification: notification,
                pushbullet: pushbullet
            };

            includeListUpdate();
        }
    }

    editName.value = il.name;
    editMatch.value = il.match;
    document.querySelector(`[name="include-list-edit-strict"][value="${il.strict ? `strict` : `loose`}"]`).checked = true;
    editSound.checked = il.sound;
    editAlarm.checked = il.alarm;
    editNotification.checked = il.notification;
    editPushbullet.checked = il.pushbullet;

    editDelete.addEventListener(`click`, editDeleteEvent);
    editSave.addEventListener(`click`, editSaveEvent);

    $(editModal).modal(`show`).on(`hidden.bs.modal`, (event) => {
        editDelete.removeEventListener(`click`, editDeleteEvent); 
        editSave.removeEventListener(`click`, editSaveEvent);
        $(editModal).off();
    });
}

function includeListUpdate() {
    const sorted = Object.keys(storage.includeList).map((currentValue) => {
        storage.includeList[currentValue].match = currentValue;
        return storage.includeList[currentValue];
    }).sort((a, b) =>  a.name > b.name);

    const body = document.getElementById(`include-list-modal`).getElementsByClassName(`modal-body`)[0];

    while (body.firstChild) {
        body.removeChild(body.firstChild);
    }

    body.appendChild((() => {
        const fragment = document.createDocumentFragment();

        for (const il of sorted) {            
            const button = document.createElement(`button`);
            button.type = `button`
            button.className = `btn btn-xs btn-success ml-1 my-1 il-btn`;
            button.textContent = il.name;
            button.addEventListener(`click`, (event) => {
                includeListEditModal(il);
            });
            fragment.appendChild(button);
        }

        return fragment;
    })());

    for (const key in finderDB) {
        const hit = finderDB[key];
        const element = document.getElementById(hit.hit_set_id);

        if (element) {
            if (includeListed(hit)) {
                element.classList.add(`included`);
            }
            else {
                element.classList.remove(`included`);
            }
        }
    }

    chrome.storage.local.set({
        includeList: storage.includeList
    });
}

function reviewModal(requesterId) {
    const review = reviewsDB[requesterId];
    const tv = review.turkerview;
    const to = review.turkopticon;
    const to2 = review.turkopticon2;

    if (storage.reviews.turkerview) {
        if (tv) {
            document.getElementById(`review-turkerview-link`).href = `https://turkerview.com/requesters/${requesterId}`;
            document.getElementById(`review-turkerview-ratings-hourly`).textContent = tv.ratings.hourly.toMoneyString();
            document.getElementById(`review-turkerview-ratings-pay`).textContent = tv.ratings.pay || `-`;
            document.getElementById(`review-turkerview-ratings-fast`).textContent = tv.ratings.fast || `-`;
            document.getElementById(`review-turkerview-ratings-comm`).textContent = tv.ratings.comm || `-`;
            document.getElementById(`review-turkerview-rejections`).textContent = tv.rejections;
            document.getElementById(`review-turkerview-tos`).textContent = tv.tos;
            document.getElementById(`review-turkerview-blocks`).textContent = tv.blocks;

            document.getElementById(`review-turkerview-review`).style.display = ``;
            document.getElementById(`review-turkerview-no-reviews`).style.display = `none`;
        }
        else {
            document.getElementById(`review-turkerview-review`).style.display = `none`;
            document.getElementById(`review-turkerview-no-reviews`).style.display = ``;
        }
        document.getElementById(`review-turkerview`).style.display = ``;
    }
    else {
        document.getElementById(`review-turkerview`).style.display = `none`;
    }

    if (storage.reviews.turkopticon) {
        if (to) {
            document.getElementById(`review-turkopticon-link`).href = `https://turkopticon.ucsd.edu/${requesterId}`;
            document.getElementById(`review-turkopticon-attrs-pay`).textContent = `${to.attrs.pay} / 5` || `- / 5`;
            document.getElementById(`review-turkopticon-attrs-fast`).textContent = `${to.attrs.fast} / 5` || `- / 5`;
            document.getElementById(`review-turkopticon-attrs-comm`).textContent = `${to.attrs.comm} / 5` || `- / 5`;
            document.getElementById(`review-turkopticon-attrs-fair`).textContent = `${to.attrs.fair} / 5` || `- / 5`;
            document.getElementById(`review-turkopticon-reviews`).textContent = to.reviews;
            document.getElementById(`review-turkopticon-tos_flags`).textContent = to.tos_flags;

            document.getElementById(`review-turkopticon-review`).style.display = ``;
            document.getElementById(`review-turkopticon-no-reviews`).style.display = `none`;
        }
        else {
            document.getElementById(`review-turkopticon-review`).style.display = `none`;
            document.getElementById(`review-turkopticon-no-reviews`).style.display = ``;
        }
        document.getElementById(`review-turkopticon`).style.display = ``;
    }
    else {
        document.getElementById(`review-turkopticon`).style.display = `none`;
    }

    if (storage.reviews.turkopticon2) {
        if (to2) {
            const recent = to2.recent;
            const all = to2.all;

            document.getElementById(`review-turkopticon2-link`).href = `https://turkopticon.info/requesters/${requesterId}`;
            document.getElementById(`review-turkopticon2-recent-reward`).textContent = recent.reward[1] > 0 ? `$${(recent.reward[0] / recent.reward[1] * 3600).toFixed(2)}` : `---`;
            document.getElementById(`review-turkopticon2-recent-pending`).textContent = recent.pending > 0 ? `${(recent.pending / 86400).toFixed(2)} days` : `---`;
            document.getElementById(`review-turkopticon2-recent-comm`).textContent = recent.comm[1] > 0 ? `${Math.round(recent.comm[0] / recent.comm[1] * 100)}% of ${recent.comm[1]}` : `---`;
            document.getElementById(`review-turkopticon2-recent-recommend`).textContent = recent.recommend[1] > 0 ? `${Math.round(recent.recommend[0] / recent.recommend[1] * 100)}% of ${recent.recommend[1]}` : `---`;
            document.getElementById(`review-turkopticon2-recent-rejected`).textContent = recent.rejected[0];
            document.getElementById(`review-turkopticon2-recent-tos`).textContent = recent.tos[0];
            document.getElementById(`review-turkopticon2-recent-broken`).textContent = recent.broken[0];

            document.getElementById(`review-turkopticon2-all-reward`).textContent = all.reward[1] > 0 ? `$${(all.reward[0] / all.reward[1] * 3600).toFixed(2)}` : `---`;
            document.getElementById(`review-turkopticon2-all-pending`).textContent = all.pending > 0 ? `${(all.pending / 86400).toFixed(2)} days` : `---`;
            document.getElementById(`review-turkopticon2-all-comm`).textContent = all.comm[1] > 0 ? `${Math.round(all.comm[0] / all.comm[1] * 100)}% of ${all.comm[1]}` : `---`;
            document.getElementById(`review-turkopticon2-all-recommend`).textContent = all.recommend[1] > 0 ? `${Math.round(all.recommend[0] / all.recommend[1] * 100)}% of ${all.recommend[1]}` : `---`;
            document.getElementById(`review-turkopticon2-all-rejected`).textContent = all.rejected[0];
            document.getElementById(`review-turkopticon2-all-tos`).textContent = all.tos[0];
            document.getElementById(`review-turkopticon2-all-broken`).textContent = all.broken[0];

            document.getElementById(`review-turkopticon2-review`).style.display = ``;
            document.getElementById(`review-turkopticon2-no-reviews`).style.display = `none`;
        }
        else {
            document.getElementById(`review-turkopticon2-review`).style.display = `none`;
            document.getElementById(`review-turkopticon2-no-reviews`).style.display = ``;
        }
    }
    else {
        document.getElementById(`review-turkopticon2`).style.display = `none`;
    }

    const modal = document.getElementById(`review-modal`);
    $(modal).modal(`show`);
}

function textToSpeech(phrase) {
    chrome.tts.speak(phrase, { enqueue: true, voiceName: `Google US English` });
}

function timeNow() {
    const date = new Date();
    let hours = date.getHours(), minutes = date.getMinutes(), ampm = hours >= 12 ? `p` : `a`;
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? `0` + minutes : minutes;
    return `${hours}:${minutes}${ampm}`;
}

document.getElementById(`finder-speed`).addEventListener(`change`, (event) => {
    storage.finder.speed = event.target.value;

    chrome.storage.local.set({
        finder: storage.finder
    });
});

document.getElementById(`optionsModal`).addEventListener(`click`, optionsModal);

function optionsModal() {
    const modal = document.getElementById(`options-modal`);
    const speed = document.getElementById(`finder-speed`);
    const filterSort = document.getElementById(`finder-filter-sort`);
    const filterPage_size = document.getElementById(`finder-filter-page_size`);
    const filterMasters = document.getElementById(`finder-filter-masters`);
    const filterQualified = document.getElementById(`finder-filter-qualified`);
    const filterMin_reward = document.getElementById(`finder-filter-min_reward`);
    const filterMin_available = document.getElementById(`finder-filter-min_available`);
    const notificationsDelay = document.getElementById(`finder-notifications-delay`);
    const notificationsNew_sound = document.getElementById(`finder-notifications-new_sound`);
    const notificationsIncluded_sound = document.getElementById(`finder-notifications-included_sound`);
    const notificationsPushbulletState = document.getElementById(`finder-notifications-pushbullet-state`);
    const notificationsPushbulletToken = document.getElementById(`finder-notifications-pushbullet-token`);
    const optionsSave = document.getElementById(`options-save`);

    function optionsSaveEvent() {
        $(modal).modal(`hide`);

        storage.finder.filter.sort = filterSort.value;
        storage.finder.filter.page_size = filterPage_size.value;
        storage.finder.filter.masters = filterMasters.checked;
        storage.finder.filter.qualified = filterQualified.checked;
        storage.finder.filter.min_reward = filterMin_reward.value;
        storage.finder.filter.min_available = filterMin_available.value;
        storage.finder.notifications.delay = notificationsDelay.value;
        storage.finder.notifications.new_sound = notificationsNew_sound.value;
        storage.finder.notifications.included_sound = notificationsIncluded_sound.value;
        storage.finder.notifications.pushbullet.state = notificationsPushbulletState.value;
        storage.finder.notifications.pushbullet.token = notificationsPushbulletToken.value;

        chrome.storage.local.set({
            finder: storage.finder
        });
    }

    filterSort.value = storage.finder.filter.sort;
    filterPage_size.value = storage.finder.filter.page_size;
    filterMasters.checked = storage.finder.filter.masters;
    filterQualified.checked = storage.finder.filter.qualified;
    filterMin_reward.value = storage.finder.filter.min_reward;
    filterMin_available.value = storage.finder.filter.min_available;
    notificationsDelay.value = storage.finder.notifications.delay;
    notificationsNew_sound.value = storage.finder.notifications.new_sound;
    notificationsIncluded_sound.value = storage.finder.notifications.included_sound;
    notificationsPushbulletState.value = storage.finder.notifications.pushbullet.state;
    notificationsPushbulletToken.value = storage.finder.notifications.pushbullet.token;

    optionsSave.addEventListener(`click`, optionsSaveEvent);

    $(modal).modal(`show`).on(`hidden.bs.modal`, (event) => {
        optionsSave.removeEventListener(`click`, optionsSaveEvent);
        $(modal).off();
    });
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

let requesterReviewsDB = (() => {
    const open = window.indexedDB.open(`requesterReviewsDB`, 1);

    open.onsuccess = (event) => {
        requesterReviewsDB = event.target.result;

        const transaction = requesterReviewsDB.transaction([`requester`], `readonly`);
        const objectStore = transaction.objectStore(`requester`);
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            if (event.target.result) {
                for (const review of event.target.result) {
                    reviewsDB[review.id] = review;  
                }
            }
        };
    };
    open.onupgradeneeded = (event) => {
        requesterReviewsDB = event.target.result;

        requesterReviewsDB.createObjectStore(`requester`, { keyPath: `id` });
    };
})();

function requesterReviewsCheck(requesters) {
    const time = new Date().getTime();
    const reviews = {};
    const transaction = requesterReviewsDB.transaction([`requester`], `readonly`);
    const objectStore = transaction.objectStore(`requester`);

    let update = false;

    for (let i = 0; i < requesters.length; i++) {
        const id = requesters[i];
        const request = objectStore.get(id);

        request.onsuccess = (event) => {
            if (event.target.result) {
                reviews[id] = event.target.result;

                if (event.target.result.time < (time - 3600000 / 2)) {
                    update = true;
                }
            } else {
                reviews[id] = {
                    id: id
                };
                update = true;
            }
        };
    }

    transaction.oncomplete = async (event) => {
        if (update) {
            const updatedReviews = await requesterReviewsUpdate(reviews, requesters);
            updateRequesterReviews(updatedReviews);
        }
    };
}

function requesterReviewsUpdate(objectReviews, arrayIds) {
    return new Promise(async (resolve) => {
        function getReviews(stringSite, stringURL) {
            return new Promise(async (resolve) => {
                try {
                    const response = await fetch(stringURL);

                    if (response.status === 200) {
                        const json = await response.json();
                        resolve([stringSite, json.data ? Object.assign(...json.data.map((item) => ({
                            [item.id]: item.attributes.aggregates
                        }))) : json]);
                    } else {
                        resolve();
                    }
                } catch (error) {
                    resolve();
                }
            });
        }

        const getReviewsAll = await Promise.all([
            getReviews(`turkerview`, `https://api.turkerview.com/api/v1/requesters/?ids=${arrayIds}&from=mts`),
            getReviews(`turkopticon`, `https://turkopticon.ucsd.edu/api/multi-attrs.php?ids=${arrayIds}`),
            getReviews(`turkopticon2`, `https://api.turkopticon.info/requesters?rids=${arrayIds}&fields[requesters]=aggregates`)
        ]);

        for (const item of getReviewsAll) {
            if (item && item.length > 0) {
                const site = item[0];
                const reviews = item[1];

                for (const key in reviews) {
                    objectReviews[key][site] = reviews[key];
                }
            }
        }

        const time = new Date().getTime();
        const transaction = requesterReviewsDB.transaction([`requester`], `readwrite`);
        const objectStore = transaction.objectStore(`requester`);

        for (const key in objectReviews) {
            const obj = objectReviews[key];

            obj.id = key;
            obj.time = time;
            objectStore.put(obj);
        }

        resolve(objectReviews);
    });
}

function requesterReviewsGet(id) {
    return new Promise((resolve) => {
        const transaction = requesterReviewsDB.transaction([`requester`], `readonly`);
        const objectStore = transaction.objectStore(`requester`);
        const request = objectStore.get(id);

        request.onsuccess = (event) => {
            resolve(event.target.result ? event.target.result : null);
        };
    });
}

function requesterReviewGetClass(review) {
    const tv = storage.reviews.turkerview ? review.turkerview : null;
    const to = storage.reviews.turkopticon ? review.turkopticon : null;
    const to2 = storage.reviews.turkopticon2 ? review.turkopticon2 : null;

    const tvPay = tv ? (tv.ratings.hourly / 3) : null;
    const tvHourly = tv ? tv.ratings.pay : null;
    const toPay = to ? to.attrs.pay : null;
    const to2Hourly = to2 ? to2.recent.reward[1] > 0 ? ((to2.recent.reward[0] / to2.recent.reward[1] * 3600) / 3) : to2.all.reward[1] > 0 ? ((to2.all.reward[0] / to2.all.reward[1] * 3600) / 3) : null : null;

    if (tvPay || tvHourly || toPay || to2Hourly) {
        const average = [tvPay, tvHourly, toPay, to2Hourly].filter(Boolean).map((currentValue, index, array) => Number(currentValue) / array.length).reduce((a, b) => a + b);
        return (average > 3.75 ? `btn-success` : average > 2 ? `btn-warning` : average > 0 ? `btn-danger` : `btn-default`);
    }

    return `btn-default`;
}

async function updateRequesterReviews(reviews) {
    for (const key in reviews) {
        reviewsDB[key] = reviews[key];

        const reviewClass = requesterReviewGetClass(reviews[key]);

        if (reviewClass) {
            for (const element of document.getElementsByClassName(key)) {
                element.classList.remove(`btn-success`, `btn-warning`, `btn-danger`);
                element.classList.add(reviewClass);
            }
        }
    }
}

(function updateTheme() {
    const theme = document.getElementById(`theme`);

    chrome.storage.local.get([`themes`], (keys) => {
        theme.href = `/bootstrap/css/${keys.themes.mts}.min.css`;

        chrome.storage.onChanged.addListener((changes) => {
            if (changes.themes) {
                theme.href = `/bootstrap/css/${changes.themes.newValue.mts}.min.css`;
            }
        });
    });
})();

function toClipBoard(string) {
    const textarea = document.createElement(`textarea`);
    textarea.opacity = 0;
    textarea.textContent = string;
    document.getElementById(`include-list-modal`).appendChild(textarea);

    textarea.select();

    const copy = document.execCommand(`copy`);
    document.getElementById(`include-list-modal`).removeChild(textarea);

    return copy ? true : false;
}

document.getElementById(`found-card-header`).addEventListener(`click`, toggleVisibility);
document.getElementById(`logged-card-header`).addEventListener(`click`, toggleVisibility);

function toggleVisibility(e) {
    const el = e.target.closest(`.card`).firstElementChild; console.log(el);
    const elParent = el.nextElementSibling;

    if ([...el.firstElementChild.classList].includes(`glyphicon-resize-small`)) {
        el.firstElementChild.classList.replace(`glyphicon-resize-small`, `glyphicon-resize-full`);
    }
    else {
        el.firstElementChild.classList.replace(`glyphicon-resize-full`, `glyphicon-resize-small`);
    }

    elParent.style.display = elParent.style.display === `none` ? `` : `none`;
}

$(`[data-toggle="tooltip"]`).tooltip({
    delay: {
        show: 500
    }
});
