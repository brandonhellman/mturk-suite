chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const hitCatcher = request.hitCatcher;

    if (hitCatcher !== undefined) {
        if (hitCatcher === `open`) {
            sendResponse(true);
        }
        else if (hitCatcher === `loggedIn` || hitCatcher === `captchaCleared`) {
            catcherPauseOff(hitCatcher);
        }
        else if (hitCatcher instanceof Object) {
            if (hitCatcher.id) {
                watcherAdd(hitCatcher);
            }
        }
    }
});

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    const hitCatcher = request.hitCatcher;

    if (hitCatcher !== undefined) {
        if (hitCatcher === `open`) {
            sendResponse(true);
        }
        else if (hitCatcher === `loggedIn` || hitCatcher === `captchaCleared`) {
            catcherPauseOff(hitCatcher);
        }
        else if (hitCatcher instanceof Object) {
            if (hitCatcher.id) {
                watcherAdd(hitCatcher);
            }
        }
    }
});

const storage = new Object();

(async () => {
    const items = await new Promise((resolve) => chrome.storage.local.get([`hitCatcher`, `order`, `watchers`, `hitCatcherWatchers`], resolve));

    ((object, test) => {
        if (object !== undefined) {
            chrome.storage.local.remove(`hitCatcherWatchers`);

            if (object instanceof Object) {
                if (object.watchers instanceof Object) {
                    items.watchers = items.watchers instanceof Object ? items.watchers : new Object();

                    for (const key in object.watchers) {
                        const oldWatcher = object.watchers[key];

                        if (oldWatcher instanceof Object) {
                            items.watchers[key] = {
                                id: key,
                                name: typeof oldWatcher.nickname === `string` ? oldWatcher.nickname : ``,
                                once: typeof oldWatcher.once === `boolean` ? oldWatcher.once : true,
                                sound: typeof oldWatcher.sound === `boolean` ? oldWatcher.sound : true
                            };
                        }
                    }
                }
            }
        }
    })(items.hitCatcherWatchers);

    ((object) => {
        storage.hitCatcher = {
            speed: 1500,
            captcha: {
                popup: false,
                hit_set_id: null
            }
        };

        if (object instanceof Object) {            
            if (typeof object.speed === `number`) {
                storage.hitCatcher.speed = object.speed;
            }

            if (object.captcha instanceof Object) {
                if (typeof object.captcha.popup === `boolean`) {
                    storage.hitCatcher.captcha.popup = object.captcha.popup;
                }
                if (typeof object.captcha.hit_set_id === `string`) {
                    storage.hitCatcher.captcha.hit_set_id = object.captcha.hit_set_id;
                }
            }
        }

        document.getElementById(`speed`).value = storage.hitCatcher.speed;
        document.getElementById(`captcha-popup`).checked = storage.hitCatcher.captcha.popup;
        document.getElementById(`captcha-hitSetId`).value = storage.hitCatcher.captcha.hit_set_id;

        chrome.storage.local.set({
            hitCatcher: storage.hitCatcher
        });
    })(items.hitCatcher);

    ((array) => {
        storage.order = array instanceof Array ? array : new Array();

        chrome.storage.local.set({
            order: storage.order
        });
    })(items.order);

    ((object) => {
        storage.watchers = object instanceof Object ? object : new Object();

        for (const key of storage.order) {
            const watcher = storage.watchers[key];

            if (watcher instanceof Object) {
                watcherDraw(watcher);
            }
        }

        for (const key in storage.watchers) {
            const watcher = storage.watchers[key];

            if (watcher instanceof Object) {
                watcherDraw(watcher);
            }
        }

        chrome.storage.local.set({
            watchers: storage.watchers
        });
    })(items.watchers);
})();

function saveAll() {
    saveOrder();
    saveWatchers();
    saveHitCatcher();
}

function saveOrder() {
    storage.order = [...document.getElementById(`watchers`).children].map((element) => element.id);

    chrome.storage.local.set({
        order: storage.order
    });
}

function saveWatchers() {
    const filtered = new Object();
    const properties = [`id`, `name`, `once`, `sound`, `project`];

    for (const key in storage.watchers) {
        const watcher = storage.watchers[key];

        filtered[key] = new Object();

        for (const prop of properties) {
            if (watcher[prop] !== undefined) {
                filtered[key][prop] = watcher[prop];
            }
        }
    }

    chrome.storage.local.set({
        watchers: filtered
    });
}

function saveHitCatcher() {
    storage.hitCatcher.speed = Number(document.getElementById(`speed`).value);
    storage.hitCatcher.captcha.popup = document.getElementById(`captcha-popup`).checked;
    storage.hitCatcher.captcha.hit_set_id = document.getElementById(`captcha-hitSetId`).value;

    chrome.storage.local.set({
        hitCatcher: storage.hitCatcher
    });
}

function addWatcher() {
    bootbox.prompt({
        title: `Add watcher by Groupd Id, Preview URL or Accept URL`,
        buttons: {
            confirm: {
                className: `btn-sm btn-success`
            },
            cancel: {
                className: `btn-sm btn-danger`
            }
        },
        callback (result) {
            if (result) {
                const watcher = {
                    id: result.match(/projects\/([A-Z0-9]+)\/tasks/) ? result.match(/projects\/([A-Z0-9]+)\/tasks/)[1] : result.match(/([A-Z0-9]+)/) ? result.match(/([A-Z0-9]+)/)[1] : result,
                    name: ``,
                    once: true,
                    sound: true
                };

                watcherAdd(watcher);
            }
        }
    });
}

function watcherAdd(watcher) {
    const id = watcher.id;
    const watchers = storage.watchers;

    if (watchers[id] === undefined) {
        watchers[id] = watcher;

        saveOrder();
        saveWatchers();

        watcherDraw(watcher);
        watcherCatchToggle(watcher);
    }
}

function watcherDraw(watcher) {
    if (document.getElementById(watcher.id) !== null) {
        return;
    }

    const container = document.createElement(`div`);
    container.id = watcher.id;
    container.className = `ol-sm-4 col-md-3 col-lg-2`;

    const card = document.createElement(`div`);
    card.className = `watcher card card-inverse card-hit`;
    container.appendChild(card);

    const cardHeader = document.createElement(`div`);
    cardHeader.className = `card-header`;
    cardHeader.style = `word-wrap: break-word;`;
    card.appendChild(cardHeader);

    const headerRight = document.createElement(`div`);
    headerRight.className = `float-right bg-primary text-white`;
    headerRight.style = `position: relative; left: 3px;`;
    cardHeader.appendChild(headerRight);

    const moveRight = document.createElement(`span`);
    moveRight.className = `move-right glyphicon glyphicon-menu-right small`;
    moveRight.addEventListener(`click`, (event) => {
        watcherMoveRight(watcher); 
    });
    headerRight.appendChild(moveRight);

    const headerIcons = document.createElement(`div`);
    headerIcons.className = `float-right`;
    cardHeader.appendChild(headerIcons);

    const settingsShow = document.createElement(`span`);
    settingsShow.className = `glyphicon glyphicon-cog text-muted align-top`;
    settingsShow.addEventListener(`click`, (event) => {
        watcherSettingsShow(watcher); 
    });
    headerIcons.appendChild(settingsShow);

    const remove = document.createElement(`span`);
    remove.className = `glyphicon glyphicon-remove text-danger align-top`;
    remove.addEventListener(`click`, (event) => {
        watcherRemove(watcher); 
    });
    headerIcons.appendChild(remove);

    const headerLeft = document.createElement(`div`);
    headerLeft.className = `float-left bg-primary text-white`;
    headerLeft.style = `position: relative; left: -3px;`;
    cardHeader.appendChild(headerLeft);

    const moveLeft = document.createElement(`span`);
    moveLeft.className = `move-left glyphicon glyphicon-menu-left small`;
    moveLeft.addEventListener(`click`, (event) => {
        watcherMoveLeft(watcher); 
    });
    headerLeft.appendChild(moveLeft);

    const name = document.createElement(`b`);
    name.className = `name`;
    name.textContent = watcher.name.length > 0 ? watcher.name : watcher.project instanceof Object && typeof watcher.project.requester_name === `string` ? watcher.project.requester_name : watcher.id;
    cardHeader.appendChild(name);

    const cardBlock = document.createElement(`div`);
    cardBlock.className = `card-block border border-top-0 border-primary`;
    card.appendChild(cardBlock);

    const cardText = document.createElement(`div`);
    cardText.className = `card-text`;
    cardBlock.appendChild(cardText);

    const div = document.createElement(`div`);
    cardText.appendChild(div);

    const stats = document.createElement(`div`);
    stats.className = `stats`;
    stats.textContent = `Caught: 0; Searched: 0; PRE: 0;`;
    stats.style = `font-size: 10px;`
    div.appendChild(stats);

    const catchToggle = document.createElement(`button`);
    catchToggle.className = `catch btn btn-xxs btn-default mr-1`;
    catchToggle.textContent = `Catch`;
    catchToggle.addEventListener(`click`, (event) => {
        watcherCatchToggle(watcher);
    });
    div.appendChild(catchToggle);

    const soundToggle = document.createElement(`button`);
    soundToggle.className = `sound btn btn-xxs ${watcher.sound === true ? `btn-success` : `btn-default`}`;
    soundToggle.textContent = `Sound`;
    soundToggle.addEventListener(`click`, (event) => {
        watcherSoundToggle(watcher);
    });
    div.appendChild(soundToggle);

    const advancedStats = document.createElement(`span`);
    advancedStats.className = `adv-stats`;
    advancedStats.style = `font-size: 10px; position: absolute; bottom: 1px; right: 2px;`;
    div.appendChild(advancedStats);

    document.getElementById(`watchers`).appendChild(container);
}

function watcherRemove(watcher) {
    bootbox.confirm({
        message: `Are you sure you want to delete this watcher?`,
        buttons: {
            confirm: {
                className: 'btn-sm btn-success'
            },
            cancel: {
                className: 'btn-sm btn-danger'
            }
        },
        animate: false,
        callback (result) {
            if (result) {
                const id = watcher.id;

                if (storage.watchers[id]) {
                    delete storage.watchers[id];
                }

                if (catcher.ids.includes(id)) {
                    catcher.ids.splice(catcher.ids.indexOf(id), 1);
                }

                if (document.getElementById(id)) {
                    document.getElementById(id).parentNode.removeChild(document.getElementById(id));
                }

                saveWatchers();
            }
        }
    });
}

function watcherCaught(watcher) {
    if (watcher.once === true) {
        watcherCatchToggle(watcher);
    }
    if (watcher.sound === true) {
        const project = watcher.project;
        textToSpeech(`HIT Caught: ${watcher.name ? watcher.name : project.requester_name}`);
    }
}

function watcherNotQualified(watcher) {
    const element = document.getElementById(watcher.id).getElementsByClassName(`watcher`)[0];
    element.className = element.className.replace(`card-inverse`, `card-warning`);

    textToSpeech(`You are not qualified to accept this HIT... watcher stopped.`);
}

function watcherRequesterBlocked(watcher) {
    const elem = document.getElementById(watcher.id).getElementsByClassName(`watcher`)[0];
    element.className = element.className.replace(`card-inverse`, `card-danger`);

    textToSpeech(`You have been blocked from accepting this HIT... watcher stopped.`);
}

function watcherUpdate(watcher) {
    const id = watcher.id;
    const pre = watcher.pre;
    const caught = watcher.caught;
    const searched = watcher.searched;

    document
        .getElementById(id)
        .getElementsByClassName(`name`)[0]
        .textContent = watcher.name.length > 0 ? watcher.name : watcher.project instanceof Object && typeof watcher.project.requester_name === `string` ? watcher.project.requester_name : watcher.id;

    document
        .getElementById(id)
        .getElementsByClassName(`stats`)[0]
        .textContent = `Caught: ${caught > 0 ? caught : 0}; Searched: ${searched > 0 ? searched : 0}; PRE: ${pre > 0 ? pre : 0};`
    ;
}

function watcherCatchToggle(watcher) {
    const id = watcher.id;
    const ids = catcher.ids;
    const element = document.getElementById(id).getElementsByClassName(`catch`)[0];
    const className = element.className;

    if (ids.includes(id) === false) {
        element.className = className.replace(`btn-default`, `btn-success`);

        ids.push(id);
        catcherRun(id);
    }
    else {
        element.className = className.replace(`btn-success`, `btn-default`);

        ids.splice(ids.indexOf(id), 1);
    }
}

function watcherSoundToggle(watcher) {
    watcher.sound = watcher.sound === true ? false : true;
    saveWatchers();

    const element = document.getElementById(watcher.id).getElementsByClassName(`sound`)[0];

    if (watcher.sound === true) {
        element.className = element.className.replace(`btn-default`, `btn-success`);
    } else {
        element.className = element.className.replace(`btn-success`, `btn-default`);
    }
}

function watcherSettingsShow(watcher) {
    document.getElementById(`watcher-settings-nickname`).value = watcher.name;
    document.getElementById(`watcher-settings-once`).checked = watcher.once;

    const project = watcher.project;

    if (project instanceof Object) {
        document.getElementById(`watcher-settings-requester-name`).textContent = project.requester_name;
        document.getElementById(`watcher-settings-requester-id`).textContent = project.requester_id;
        document.getElementById(`watcher-settings-title`).textContent = project.title;
        document.getElementById(`watcher-settings-hit-set-id`).textContent = project.hit_set_id;
        document.getElementById(`watcher-settings-reward`).textContent = project.monetary_reward.amount_in_dollars.toMoneyString();
        document.getElementById(`watcher-settings-duration`).textContent = project.assignment_duration_in_seconds.toTimeString();
        document.getElementById(`watcher-settings-requirements`).textContent = (project.hit_requirements || project.project_requirements).map(o => `${o.qualification_type.name} ${o.comparator} ${o.qualification_values.map(v => v).join(`, `)}`.trim()).join(`; `) || `None`;

    } else {
        document.getElementById(`watcher-settings-requester-name`).textContent = ``;
        document.getElementById(`watcher-settings-requester-id`).textContent = ``;
        document.getElementById(`watcher-settings-title`).textContent = ``;
        document.getElementById(`watcher-settings-hit-set-id`).textContent = ``;
        document.getElementById(`watcher-settings-reward`).textContent = ``;
        document.getElementById(`watcher-settings-duration`).textContent = ``;
        document.getElementById(`watcher-settings-requirements`).textContent = ``;
    }

    $(`#watcher-settings-modal`).modal(`show`);

    $(`#watcher-settings-modal`).on(`hidden.bs.modal`, (event) => {
        $(`#watcher-settings-modal`).off(`hidden.bs.modal`);

        watcher.name = document.getElementById(`watcher-settings-nickname`).value;
        watcher.once = document.getElementById(`watcher-settings-once`).checked;
        watcherUpdate(watcher);
        saveWatchers();
    });
}

function watcherMoveLeft(watcher) {
    const element = document.getElementById(watcher.id);
    const elementPrev = element.previousElementSibling;

    if (elementPrev !== null) {
        element.parentNode.insertBefore(element, elementPrev);
        saveOrder();
    }
}

function watcherMoveRight(watcher) {
    const element = document.getElementById(watcher.id);
    const elementNext = element.nextElementSibling;

    if (elementNext !== null) {
        element.parentNode.insertBefore(elementNext, element);
        saveOrder();
    }
}

const catcher = {
    ids: new Array(),
    stats: new Object(),
    index: 0,
    timeout: null, running: false, runHF: false,
    paused: {
        status: false,
        reason: null
    }
};

let timer = 0;

async function catcherRun(forcedId) {
    const start = new Date().getTime();

    cacheVoice()
    function delay() {
        const nextCatch = start + storage.hitCatcher.speed;
        const adjustedDelay = nextCatch - new Date().getTime();
        return adjustedDelay > 0 ? adjustedDelay : 1;
    }

    clearTimeout(catcher.timeout);

    if (catcher.paused.status === false && catcher.ids.length > 0) {
        const id = typeof forcedId === `string` && catcher.ids.includes(forcedId) === true ? forcedId : catcher.ids[catcher.index = catcher.index >= catcher.ids.length -1 ? 0 : catcher.index + 1];
        const watcher = storage.watchers[id];

        var err;
        const response = await fetch(`https://worker.mturk.com/projects/${id}/tasks/accept_random?format=json`, {
            credentials: `include`,
            redirect: `follow`,
        })
        .catch(e => err = e);

        if (response.status == 200 || response.status == 429 || response.status == 422) {
            watcher.searched = watcher.searched > 0 ? watcher.searched + 1 : 1;

            const status = response.status;

            if (response.ok && response.url.indexOf(`tasks`) !== -1) {
                if (!watcher.project) {
                    const text = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, `text/html`);
                    const json = JSON.parse(doc.querySelector(`[data-react-class="require('reactComponents/common/ShowModal')['default']"]`).dataset.reactProps);

                    watcher.project = watcher.project ? watcher.project : {
                        requester_name: json.modalOptions.requesterName,
                        requester_id: json.modalOptions.contactRequesterUrl.match(/requester_id.+?=([0-9A-Z]+)/) ? json.modalOptions.contactRequesterUrl.match(/requester_id.+?=([0-9A-Z]+)/)[1] : null,
                        title: json.modalOptions.projectTitle,
                        hit_set_id: response.url.match(/projects\/([A-Z0-9]+)\/tasks/) ? response.url.match(/projects\/([A-Z0-9]+)\/tasks/)[1] : null,
                        monetary_reward: {
                            amount_in_dollars: json.modalOptions.monetaryReward.amountInDollars
                        },
                        assignment_duration_in_seconds: json.modalOptions.assignmentDurationInSeconds,
                        project_requirements: [{qualification_type: { name: `Unknown` }, comparator: `Unknown`, qualification_values: [``]}]

                    }
                }

                if (~response.url.indexOf(`assignment_id=`)) {
                    watcher.caught = watcher.caught > 0 ? watcher.caught + 1 : 1;
                    watcherCaught(watcher);
                } else {
                    return catcherCaptchaFound();
                }

            }
            else if (status === 429) {
                watcher.pre = watcher.pre > 0 ? watcher.pre + 1 : 1;
            }

            watcherUpdate(watcher);
            catcher.timeout = setTimeout(catcherRun, delay(), status === 429 ? id : undefined);
        } else if (err instanceof TypeError) {
            return catcherLoggedOut();
        }
    }
    else if (catcher.paused.status === false) {

    }
}

function catcherPauseOn(reason) {
    const paused = catcher.paused.status;

    paused.status = true;
    paused.reason = reason;

    const element = document.getElementById(`pause`);
    element.className = element.className.replace(`btn-default`, `btn-danger`);
}

function catcherPauseOff(reason) {
    const paused = catcher.paused.status;

    if (reason === undefined || reason === paused.reason) {
        paused.status = false;
        paused.reason = null;

        const element = document.getElementById(`pause`);
        element.className = element.className.replace(`btn-danger`, `btn-default`);

        bootbox.hideAll();
        catcherRun();
    }
}

function catcherPauseToggle() {
    const paused = catcher.paused;
    const element = document.getElementById(`pause`);
    const className = element.className;

    paused.status = !paused.status;

    if (paused.status) {
        element.className = className.replace(`btn-default`, `btn-danger`);
    }
    else {
        element.className = className.replace(`btn-danger`, `btn-default`);

        catcherRun();
    }
}

function catcherLoggedOut() {
    catcherPauseOn(`loggedOut`);
    textToSpeech(`You are logged out. HIT Catcher paused.`);

    bootbox.confirm({
        message: `You are logged out. Do you want to resume HIT Catcher?`,
        buttons: {
            confirm: {
                className: `btn-sm btn-success`
            },
            cancel: {
                className: `btn-sm btn-danger`
            }
        },
        animate: false,
        callback (result) {
            if (result) {
                catcherPauseOff();
            }
        }
    });
}

function catcherCaptchaFound() {
    catcherPauseOn(`captchaFound`);
    textToSpeech(`Captcha found. HIT Catcher paused.`);

    bootbox.confirm({
        message: `Captcha found. Do you want to resume HIT Catcher?`,
        buttons: {
            confirm: {
                className: `btn-sm btn-success`
            },
            cancel: {
                className: `btn-sm btn-danger`
            }
        },
        animate: false,
        callback (result) {
            if (result) {
                catcherPauseOff();
            }
        }
    });

    const captcha = storage.hitCatcher.captcha;
    const hit_set_id = captcha.hit_set_id;

    if (captcha.popup === true && typeof hit_set_id === `string` && hit_set_id.length > 10) {
        window.open(`https://worker.mturk.com/projects/${hit_set_id}/tasks?ref=w_pl_prvw`, `hcPopup`, `width=800, height=600`);
    }
}

function cacheVoice(){
    if (!('voice' in window) || voice == undefined){
        voice = speechSynthesis.getVoices().filter((voice) => voice.name == `Google US English`)[0];
    }
}

async function textToSpeech(phrase) {
    const message = new SpeechSynthesisUtterance(phrase);
    message.voice = window.voice;
    window.speechSynthesis.speak(message);
}

document.getElementById(`pause`).addEventListener(`click`, catcherPauseToggle);
document.getElementById(`add-watcher`).addEventListener(`click`, addWatcher);

document.addEventListener(`click`, (event) => {
    const element = event.target;

    if (element.matches(`#advanced_settings`)) {
        $(document.getElementById(`advanced_settings_modal`)).modal(`show`);
    }

    // Ctrl click to select or deselect watchers
    if (event.ctrlKey) {
        const watcher = $(element).parents(`.watcher`)[0];

        if (watcher && watcher.matches(`.selected`)) {
            watcher.classList.remove(`selected`);
        }
        else if (watcher) {
            watcher.classList.add(`selected`);
        }
    }
});

document.addEventListener(`change`, (event) => {
    saveAll();
});

window.addEventListener(`keydown`, (event) => {
    const key = event.key;

    if (key === `Enter`) {
        if (document.getElementsByClassName(`bootbox`)[0]) {
            document.getElementsByClassName(`bootbox`)[0].querySelector(`[data-bb-handler="confirm"]`).click();
            bootbox.hideAll();
        }
    }

    if (key === `Delete`) {
        const ids = [];

        for (let element of document.getElementsByClassName(`selected`)) {
            ids.push(element.parentNode.id);
        }

        if (ids[0]) {
            bootbox.confirm({
                message: `Are you sure you want to delete all selected watchers?`,
                buttons: {
                    confirm: {
                        className: 'btn-sm btn-success'
                    },
                    cancel: {
                        className: 'btn-sm btn-danger'
                    }
                },
                animate: false,
                callback (result) {
                    if (result) {
                        for (const id of ids) {
                            delete storage.watchers[id];

                            if (catcher.ids.includes(id)) {
                                catcher.ids.splice(catcher.ids.indexOf(id), 1);
                            }

                            document.getElementById(id).parentNode.removeChild(document.getElementById(id));
                        }

                        saveWatchers();
                    }
                }
            });  
        }
    }
});

window.addEventListener(`beforeunload`, (event) => {
    saveAll();
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
