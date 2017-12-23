let hitTrackerDB, updating = false;

(() => {
    const open = window.indexedDB.open(`hitTrackerDB`, 1);

    open.onsuccess = (e) => {
        hitTrackerDB = e.target.result;
        getTodaysInfo();
    };
    open.onupgradeneeded = (e) => {
        alert(`Something went wrong, please reload MTS`);
    };
    open.onerror = (e) => {
        alert(`Something went wrong, please reload MTS`);
    };
})();

function getTodaysInfo() {
    const transaction = hitTrackerDB.transaction([`hit`], `readonly`);
    const objectStore = transaction.objectStore(`hit`);
    const index = objectStore.index(`date`);
    const request = index.getAll(mturkDate());

    request.onsuccess = (e) => {
        displayTodaysInfo(e.target.result);
    };
}

function displayTodaysInfo(hits) {
    const today = {
        assigned: {
            count: 0,
            value: 0
        },
        submitted: {
            count: 0,
            value: 0
        },
        approved: {
            count: 0,
            value: 0
        },
        rejected: {
            count: 0,
            value: 0
        },
        pending: {
            count: 0,
            value: 0
        },
        returned: {
            count: 0,
            value: 0
        },
    };
    const requesters = {};

    for (const hit of hits) {
        const state = hit.state;
        const reward = hit.reward.amount_in_dollars;
        const requesterId = hit.requester_id;

        if (hit.state.match(/Submitted|Pending|Approved|Paid/)) {
            today.submitted.count ++;
            today.submitted.value += reward

            if (hit.state.match(/Approved|Paid/)) {
                today.approved.count ++;
                today.approved.value += reward
            }
            else if (hit.state.match(/Submitted|Pending/)) {
                today.pending.count ++;
                today.pending.value += reward
            }

            if (!requesters[requesterId]) {
                requesters[requesterId] = {
                    id: requesterId,
                    name: hit.requester_name,
                    count: 1,
                    value: reward
                };
            }
            else {
                requesters[requesterId].count ++;
                requesters[requesterId].value += reward;
            }
        }
        else if (hit.state.match(/Returned/)) {
            today.returned.count ++;
            today.returned.value += reward
        }
        else if (hit.state.match(/Rejected/)) {
            today.rejected.count ++;
            today.rejected.value += reward
        }

        today.assigned.count ++;
        today.assigned.value += reward
    }

    document.getElementById(`assigned-count`).textContent = today.assigned.count;
    document.getElementById(`assigned-value`).textContent = today.assigned.value.toMoneyString();

    document.getElementById(`submitted-count`).textContent = today.submitted.count;
    document.getElementById(`submitted-value`).textContent = today.submitted.value.toMoneyString();

    document.getElementById(`approved-count`).textContent = today.approved.count;
    document.getElementById(`approved-value`).textContent = today.approved.value.toMoneyString();

    document.getElementById(`rejected-count`).textContent = today.rejected.count;
    document.getElementById(`rejected-value`).textContent = today.rejected.value.toMoneyString();

    document.getElementById(`pending-count`).textContent = today.pending.count;
    document.getElementById(`pending-value`).textContent = today.pending.value.toMoneyString();

    document.getElementById(`returned-count`).textContent = today.returned.count;
    document.getElementById(`returned-value`).textContent = today.returned.value.toMoneyString();

    const sorted = Object.keys(requesters).sort((a, b) => requesters[a].reward - requesters[b].reward);

    for (let i = sorted.length - 1; i > -1; i --) {
        const req = requesters[sorted[i]];

        const row = document.createElement(`tr`);

        const requester = document.createElement(`td`);
        row.append(requester);

        const requesterLink = document.createElement(`a`);
        requesterLink.href = `https://worker.mturk.com/requesters/${req.id}/projects`;
        requesterLink.target = `_blank`;
        requesterLink.textContent = req.name;
        requester.appendChild(requesterLink);

        const count = document.createElement(`td`);
        count.textContent = req.count;
        row.appendChild(count);

        const value = document.createElement(`td`);
        value.textContent = req.value.toMoneyString();
        row.appendChild(value);

        document.getElementById(`requester-tbody`).appendChild(row);
    }

    document.getElementById(`projected`).textContent = today.submitted.value.toMoneyString();

    chrome.storage.local.set({
        earnings: today.submitted.value
    });
}

function updateDay(date) {
    return new Promise(async (resolve, reject) => {
        updating = true;

        syncModalUpdate(date, 0, 0);

        const modal = document.getElementById(`sync-modal`);

        $(modal).modal({ backdrop: `static`, keyboard: false });

        await syncQueue(await getQueue());
        await syncDay(date);

        updating = false;

        $(modal).modal(`hide`);

        resolve();
    });
}

function syncDay(date) {
    return new Promise(async (resolve, reject) => {
        const syncData = {}
        const fetchDate = [date.slice(0, 4), date.slice(4,6), date.slice(6,8)].join(`-`);

        (async function syncDayLoop(page) {
            const response = await fetch(`https://worker.mturk.com/status_details/${fetchDate}?page_number=${page}&format=json`, {
                credentials: `include`
            });

            if (response.ok) {
                const json = await response.json();

                if (json.num_results > 0) {
                    syncModalUpdate(date, page, json.total_num_results);

                    const transaction = hitTrackerDB.transaction([`hit`], `readwrite`);
                    const objectStore = transaction.objectStore(`hit`);

                    for (const hit of json.results) {
                        const request = objectStore.get(hit.hit_id);

                        request.onsuccess = (event) => {
                            const result = event.target.result

                            if (result) {
                                for (const prop in result) {
                                    hit[prop] = result[prop];
                                }
                            }

                            hit.date = date;
                            objectStore.put(hit);
                        };
                    }

                    transaction.oncomplete = (e) => {
                        return syncDayLoop(++ page)
                    }
                }
                else {
                    resolve();
                }
            }
            else {
                return setTimeout(syncDayLoop, 2000, page);
            }
        })(1);
    });
}

function syncModalUpdate(date, page, hits) {
    if (date) {
        document.getElementById(`sync-date`).textContent = [date.slice(0, 4), date.slice(4, 6), date.slice(6, 8)].join(`-`);
    }
    if (page) {
        document.getElementById(`sync-page-current`).textContent = page;
    }
    if (hits) {
        document.getElementById(`sync-page-total`).textContent = Math.ceil(hits / 20);
        document.getElementById(`sync-hits-total`).textContent = hits;
    }    
}

function getQueue() {
    return new Promise(async (resolve, reject) => {
        const response = await fetch(`https://worker.mturk.com/tasks?format=json`, { credentials: `include` });

        if (response.ok) {
            const json = await response.json();
            resolve(json);
        }
        else {
            reject();
        }
    });
}

function syncQueue(queue) {
    return new Promise(async (resolve) => {
        const transaction = hitTrackerDB.transaction([`hit`], `readwrite`);
        const objectStore = transaction.objectStore(`hit`);
        const index = objectStore.index(`state`);
        const only = IDBKeyRange.only(`Assigned`);

        const hit_ids = queue.tasks.map((o) => o.task_id);

        if (hit_ids.length) {
            index.openCursor(only).onsuccess = (event) => {
                const cursor = event.target.result;

                if (cursor) {
                    if (!hit_ids.includes(cursor.value.hit_id)) {
                        cursor.value.state = `Abandoned`;
                        cursor.update(cursor.value);
                    }

                    cursor.continue();
                }
            };
        }
        else {
            index.openCursor(only).onsuccess = (event) => {
                const cursor = event.target.result;

                if (cursor) {                            
                    cursor.value.state = `Abandoned`
                    cursor.update(cursor.value);
                    cursor.continue();
                }
            };
        }

        transaction.oncomplete = (event) => {
            resolve();
        };
    });
}

function mturkDate() {
    function dst() {
        const today = new Date();
        const year = today.getFullYear();
        let start = new Date(`March 14, ${year} 02:00:00`);
        let end = new Date(`November 07, ${year} 02:00:00`);
        let day = start.getDay();
        start.setDate(14 - day);
        day = end.getDay();
        end.setDate(7 - day);
        return (today >= start && today < end) ? true : false;
    }

    const given = new Date();
    const utc = given.getTime() + (given.getTimezoneOffset() * 60000);
    const offset = dst() === true ? `-7` : `-8`;
    const amz = new Date(utc + (3600000 * offset));
    const day = (amz.getDate()) < 10 ? `0` + (amz.getDate()).toString() : (amz.getDate()).toString();
    const month = (amz.getMonth() + 1) < 10 ? `0` + (amz.getMonth() + 1).toString() : ((amz.getMonth() + 1)).toString();
    const year = (amz.getFullYear()).toString();
    return year + month + day;
}

Object.assign(Number.prototype, {
    toMoneyString() {
        return `$${this.toFixed(2).toLocaleString(`en-US`, { minimumFractionDigits: 2 })}`;
    }
});

document.getElementById(`sync`).addEventListener(`click`, async (e) => {
    await updateDay(mturkDate());
    getTodaysInfo();
    chrome.runtime.sendMessage({ function: `hitTrackerGetProjected` });
});


function syncAll() {
    const modal = document.getElementById(`sync-modal`);
    updating = true;

    return new Promise(async (resolve) => {
        syncingStarted();

        const dashboard = await fetchDashboard();
        const daysToUpdate = await checkDays(dashboard.daily_hit_statistics_overview);

        for (const date of daysToUpdate) {
            await sync(date);
            await saveDay(date);
        }

        sycningEnded();
    });
}

//syncAll();

function fetchQueue(date) {
    syncingUpdated(date, `fetching queue`);

    return new Promise((resolve) => {
        (async function fetchLoop() {
            try {
                const response = await fetch(`https://worker.mturk.com/tasks?format=json`, {
                    credentials: `include`
                });

                if (response.ok && response.url === `https://worker.mturk.com/tasks?format=json`) {
                    const json = await response.json();
                    resolve(json);
                }
                else if (response.url.indexOf(`https://worker.mturk.com/`) === -1) {
                    //we are logged out here
                }
                else {
                    setTimeout(fetchLoop, 2000);
                }
            }
            catch (error) {
                setTimeout(fetchLoop, 2000);
            }
        })();
    });
}

function fetchDashboard(date) {
    syncingUpdated(date, `fetching dashboard`);

    return new Promise(async (resolve) => {
        (async function fetchLoop() {
            try {
                const response = await fetch(`https://worker.mturk.com/dashboard?format=json`, {
                    credentials: `include`
                });

                if (response.ok && response.url === `https://worker.mturk.com/dashboard?format=json`) {
                    const json = await response.json();
                    resolve(json);
                }
                else if (response.url.indexOf(`https://worker.mturk.com/`) === -1) {
                    throw `You are logged out!`;
                }
                else {
                    setTimeout(fetchLoop, 2000);
                }
            }
            catch (error) {
                setTimeout(fetchLoop, 2000);
            }
        })();
    });
}


function checkDays(days) {
    syncingUpdated(null, `checking days`);

    return new Promise((resolve) => {
        const dates = [`20171221`, `20171220`]//[`20171221`, `20171220`, `20171219`, `20171218`, `20171217`];//days.map((o) => o.date.substring(0, 10).replace(/-/g, ``));
        const transaction = hitTrackerDB.transaction([`day`], `readwrite`);
        const objectStore = transaction.objectStore(`day`);
        const bound = IDBKeyRange.bound(dates[dates.length - 1], dates[0]);

        objectStore.openCursor(bound).onsuccess = (event) => {
            const cursor = event.target.result; console.log(cursor);

            if (cursor) {
                console.log(cursor);
            }
        };

        transaction.oncomplete = (event) => {
            resolve(dates);
        };
    });
}

function saveDay(date) {
    return new Promise(async (resolve) => {
        const count = await countDay(date);
        console.log(count);
        
        const transaction = hitTrackerDB.transaction([`day`], `readwrite`);
        const objectStore = transaction.objectStore(`day`);
        
        objectStore.put(count);

        transaction.oncomplete = (event) => {
            resolve();
        };
        
    });
}

const sampleHit = {
    hit_id: String,
    requester_feedback: String,
    requester_id: String,
    requester_name: String,
    reward: {
        amount_in_dollars: Number,
        currency_code: String
    },
    state: String,
    title: String,

    date: String,
    source: String,
    answer: Object
};


function countDay(date) {
    return new Promise((resolve) => {
        const object = {
            date: date,
            assigned: 0,  
            returned: 0, 
            abandoned: 0, 
            submitted: 0, 
            approved: 0, 
            rejected: 0, 
            pending: 0,
            paid: 0,
            earnings: 0
        };

        const transaction = hitTrackerDB.transaction([`hit`], `readonly`);
        const objectStore = transaction.objectStore(`hit`);
        const index = objectStore.index(`date`);
        const only = IDBKeyRange.only(date);

        index.openCursor(only).onsuccess = (event) => {
            const cursor = event.target.result;

            if (cursor) {
                const state = cursor.value.state.toLowerCase();
                
                object[state] ++;
                object.earnings += cursor.value.reward.amount_in_dollars;

                cursor.continue();
            }
        };

        transaction.oncomplete = (event) => {
            resolve(object);
        };
    });
}

function syncPrepareDay(date) {
    syncingUpdated(date, `preparing sync`);

    return new Promise(async (resolve) => {
        const queue = await fetchQueue();
        const hit_ids = queue.tasks.map((o) => o.task_id);

        const transaction = hitTrackerDB.transaction([`hit`], `readwrite`);
        const objectStore = transaction.objectStore(`hit`);
        const index = objectStore.index(`date`);
        const only = IDBKeyRange.only(date);

        index.openCursor(only).onsuccess = (event) => {
            const cursor = event.target.result;

            if (cursor) {
                if (cursor.value.state.match(/Accepted|Submitted/) || (cursor.value.state === `Assigned` && !hit_ids.includes(cursor.value.hit_id))) {
                    cursor.value.state = `Abandoned`;
                    cursor.update(cursor.value);
                }
                cursor.continue();
            }
        };

        transaction.oncomplete = (event) => {
            resolve();
        }
    });
}

function sync(date) {
    return new Promise(async (resolve, reject) => {
        await syncPrepareDay(date);

        const fetchDate = [date.slice(0, 4), date.slice(4,6), date.slice(6,8)].join(`-`);

        (async function fetchLoop(page) {
            const url = `https://worker.mturk.com/status_details/${fetchDate}?page_number=${page}&format=json`;
            const response = await fetch(url, {
                credentials: `include`
            });

            if (response.ok && response.url === url) {
                const json = await response.json();

                if (json.num_results > 0) {
                    syncingUpdated(date, `Updating page ${page} of ${Math.ceil(json.total_num_results / 20)} for ${json.total_num_results} HITs`);

                    const transaction = hitTrackerDB.transaction([`hit`], `readwrite`);
                    const objectStore = transaction.objectStore(`hit`);

                    for (const hit of json.results) {
                        const request = objectStore.get(hit.hit_id);

                        request.onsuccess = (event) => {
                            const result = event.target.result

                            if (result) {
                                for (const prop in result) {
                                    if (prop !== `state`) {
                                        hit[prop] = result[prop] ? result[prop] : hit[prop];
                                    }
                                }
                            }

                            hit.date = date;
                            objectStore.put(hit);
                        };
                    }

                    transaction.oncomplete = (e) => {
                        return fetchLoop(++ page)
                    }
                }
                else {
                    resolve();
                }
            }
            else if (response.url.indexOf(`https://worker.mturk.com/`) === -1) {
                throw `You are logged out!`;
            }
            else {
                return setTimeout(fetchLoop, 2000, page);
            }
        })(1);
    });
}

function syncingStarted() {    
    updating = true;

    $(document.getElementById(`sync-modal`)).modal({
        backdrop: `static`,
        keyboard: false
    });
}

function syncingUpdated(date, message) {
    document.getElementById(`sync-date`).textContent = date ? [date.slice(0, 4), date.slice(4, 6), date.slice(6, 8)].join(`-`) : null;
    document.getElementById(`sync-message`).textContent = message ? message : null;
    console.log(date, message);
}

function sycningEnded() {
    updating = false;
    $(document.getElementById(`sync-modal`)).modal(`hide`);
}


//View Pending: Submitted
//View Paid: Paid

































































