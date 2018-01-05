Object.assign(Number.prototype, {
    toMoneyString() {
        return `$${this.toFixed(2).toLocaleString(`en-US`, { minimumFractionDigits: 2 })}`;
    }
});

let hitTrackerDB, updating = false;

(() => {
    const open = window.indexedDB.open(`hitTrackerDB`, 1);

    open.onsuccess = (e) => {
        hitTrackerDB = e.target.result;
        getTodaysInfo();
        getTrackerInfo();
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

    const requesterTbody = document.getElementById(`requester-tbody`);

    while (requesterTbody.firstChild) {
        requesterTbody.removeChild(requesterTbody.firstChild);
    }

    const sorted = Object.keys(requesters).sort((a, b) => requesters[a].value - requesters[b].value);

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

        requesterTbody.appendChild(row);
    }

    document.getElementById(`tracker-projected-today-count`).textContent = today.submitted.count;
    document.getElementById(`tracker-projected-today-value`).textContent = today.submitted.value.toMoneyString();

    chrome.storage.local.set({
        earnings: today.submitted.value
    });
}



function syncDay(date) {
    return new Promise(async (resolve) => {
        syncingStarted();

        const dash = await fetchDashboard();
        const days = dash.daily_hit_statistics_overview.reduce((acc, cV) => { acc[cV.date.substring(0, 10).replace(/-/g, ``)] = cV; return acc; }, {});

        await updateDashboard(days);

        await sync(date);
        await saveDay(date);

        sycningEnded();        
        resolve();
    });
}

function syncLast45() {
    return new Promise(async (resolve) => {
        syncingStarted();

        const dash = await fetchDashboard();
        const days = dash.daily_hit_statistics_overview.reduce((acc, cV) => { acc[cV.date.substring(0, 10).replace(/-/g, ``)] = cV; return acc; }, {});

        await updateDashboard(days);
        const daysToUpdate = await checkDays(days);

        for (const date of daysToUpdate) {
            await sync(date);
            await saveDay(date);
        }

        sycningEnded();
        resolve();
    });
}

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
                    return loggedOut();
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

function updateDashboard(days) {
    return new Promise((resolve) => {
        const transaction = hitTrackerDB.transaction([`day`], `readwrite`);
        const objectStore = transaction.objectStore(`day`);

        for (const day in days) {
            const request = objectStore.get(day);

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
                };

                result.day = days[day];
                objectStore.put(result);
            };
        }

        transaction.oncomplete = (event) => {
            resolve();
        }
    });
}

function checkDays(days) {
    syncingUpdated(null, `checking last 45 days`);

    const daysArray = Object.keys(days).sort();

    return new Promise((resolve) => {
        const transaction = hitTrackerDB.transaction([`day`], `readwrite`);
        const objectStore = transaction.objectStore(`day`);
        const bound = IDBKeyRange.bound(daysArray[0], daysArray[daysArray.length - 1]);

        objectStore.openCursor(bound).onsuccess = (event) => {
            const cursor = event.target.result;

            if (cursor) {
                const value = cursor.value;
                const now = value.day;

                const pending = now.pending === value.submitted;
                const approved = now.approved === value.paid;
                const rejected = now.rejected === value.rejected;
                const submitted = now.submitted === value.submitted + value.approved + value.rejected + value.paid;

                if (approved && pending && rejected && submitted) {
                    const i = daysArray.indexOf(value.date);

                    if (i !== -1) {
                        const spliced = daysArray.splice(i, 1);
                        saveDay(spliced[0]);
                    }
                }

                cursor.continue();
            }
        };

        transaction.oncomplete = (event) => {
            resolve(daysArray);
        };
    });
}

function saveDay(date) {
    return new Promise(async (resolve) => {
        const count = await countDay(date);

        const transaction = hitTrackerDB.transaction([`day`], `readwrite`);
        const objectStore = transaction.objectStore(`day`);

        const request = objectStore.get(date);

        request.onsuccess = (event) => {
            const result = event.target.result

            if (result) {
                count.day = result.day;
            }

            objectStore.put(count);
        };

        transaction.oncomplete = (event) => {
            resolve();
        };
    });
}

function countDay(date) {
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

                if (state.match(/paid/)) {
                    object.earnings += cursor.value.reward.amount_in_dollars;
                }
                cursor.continue();
            }
        };

        transaction.oncomplete = (event) => {
            object.earnings = Number(object.earnings.toFixed(2));
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

                            if (hit.state === `Approved` && hit.reward.amount_in_dollars == 0) {
                                hit.state = `Paid`;
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
}

function sycningEnded() {
    updating = false;
    $(document.getElementById(`sync-modal`)).modal(`hide`);
}

function loggedOut() {
    textToSpeech(`Attention, you are logged out of MTurk.`);
    sycningEnded();
}

function getTrackerInfo() {
    const transaction = hitTrackerDB.transaction([`hit`], `readonly`);
    const objectStore = transaction.objectStore(`hit`);
    const indexDate = objectStore.index(`date`);
    const indexState = objectStore.index(`state`);
    const onlyApproved = IDBKeyRange.only(`Approved`);
    const onlySubmitted = IDBKeyRange.only(`Submitted`);

    let approvedCount = 0, approvedValue = 0;
    indexState.openCursor(onlyApproved).onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
            approvedCount ++;
            approvedValue += cursor.value.reward.amount_in_dollars
            cursor.continue();
        }
        else {
            document.getElementById(`tracker-approved-count`).textContent = approvedCount;
            document.getElementById(`tracker-approved-value`).textContent = approvedValue.toMoneyString();
        }
    };

    let submittedValue = 0, submittedCount = 0;
    indexState.openCursor(onlySubmitted).onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
            submittedCount ++;
            submittedValue += cursor.value.reward.amount_in_dollars
            cursor.continue();
        }
        else {
            document.getElementById(`tracker-pending-count`).textContent = submittedCount;
            document.getElementById(`tracker-pending-value`).textContent = submittedValue.toMoneyString();
        }
    };

    const week = getWeek(), month = getMonth();
    const boundWeek = IDBKeyRange.bound(week.start, week.end);
    const boundMonth = IDBKeyRange.bound(month.start, month.end);

    let weekCount = 0, weekValue = 0;
    indexDate.openCursor(boundWeek).onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
            if (cursor.value.state.match(/Submitted|Pending|Approved|Paid/)) {
                weekCount ++;
                weekValue += cursor.value.reward.amount_in_dollars;
            }
            cursor.continue();
        }
        else {
            document.getElementById(`tracker-projected-week-count`).textContent = weekCount;
            document.getElementById(`tracker-projected-week-value`).textContent = weekValue.toMoneyString();
        }
    };

    let monthCount = 0, monthValue = 0;
    indexDate.openCursor(boundMonth).onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
            if (cursor.value.state.match(/Submitted|Pending|Approved|Paid/)) {
                monthCount ++;
                monthValue += cursor.value.reward.amount_in_dollars
            }
            cursor.continue();
        }
        else {
            document.getElementById(`tracker-projected-month-count`).textContent = monthCount;
            document.getElementById(`tracker-projected-month-value`).textContent = monthValue.toMoneyString();
        }
    };

    transaction.oncomplete = (event) => {
        document.getElementById(`tracker-pending-value`).textContent = submittedValue.toMoneyString();

    }
}


function getWeek() {
    const today = mturkDateString();
    const month = (today.getMonth() + 1) < 10 ? `0` + (today.getMonth() + 1).toString() : ((today.getMonth() + 1)).toString();
    const year = (today.getFullYear()).toString();
    const date = new Date(today);

    return {
        start: year + month + (date.getDate() - date.getDay()),
        end: year + month + (date.getDate() - date.getDay() + 6),
    }
}

function getMonth() {
    const today = mturkDateString();
    const month = (today.getMonth() + 1) < 10 ? `0` + (today.getMonth() + 1).toString() : ((today.getMonth() + 1)).toString();
    const year = (today.getFullYear()).toString();
    const date = new Date(today);


    return {
        start: year + month + `01`,
        end: mturkDate(),
    }
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

function mturkDateString() {
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
    return amz;
}

document.getElementById(`sync-today`).addEventListener(`click`, async (e) => {
    await syncDay(mturkDate());

    getTodaysInfo();
    getTrackerInfo();

    chrome.runtime.sendMessage({
        function: `hitTrackerGetProjected`
    });
});

document.getElementById(`sync-last-45-days`).addEventListener(`click`, async (e) => {
    await syncLast45();

    getTodaysInfo();
    getTrackerInfo();

    chrome.runtime.sendMessage({
        function: `hitTrackerGetProjected`
    });
});

document.getElementById(`requester-overview`).addEventListener(`click`, requesterOverview);
document.getElementById(`daily-overview`).addEventListener(`click`, dailyOverview);
document.getElementById(`search`).addEventListener(`click`, search);

async function requesterOverview() {
    statusStart({
        header: `Requester Overview`,
        message: `Starting`
    });

    const results = document.getElementById(`history-results`);
    const dateTo = document.getElementById(`date-to`).value;
    const dateFrom = document.getElementById(`date-from`).value;

    const transaction = hitTrackerDB.transaction([`hit`], `readonly`);
    const objectStore = transaction.objectStore(`hit`);
    const range = IDBKeyRange.bound(dateFrom.replace(/-/g, ``) || `0`, dateTo.replace(/-/g, ``) || `99999999`);

    let cursorCount = 0, cursorAccumulator = {};

    objectStore.index(`date`).openCursor(range).onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
            statusUpdate({ message: `Processing HIT ${++ cursorCount}` });
            
            const hit = cursor.value;
            const requester_id = hit.requester_id;

            if (hit.state.match(/Submitted|Pending|Approved|Paid/)) {
                if (cursorAccumulator[requester_id]) {
                    cursorAccumulator[requester_id].count += 1;
                    cursorAccumulator[requester_id].value += hit.reward.amount_in_dollars;
                }
                else {
                    cursorAccumulator[requester_id] = {
                        id: requester_id,
                        name: hit.requester_name,
                        count: 1,
                        value: hit.reward.amount_in_dollars
                    }
                }
            }

            return cursor.continue();
        }
        else {
            while (results.firstChild) {
                results.removeChild(results.firstChild);
            }

            const sorted = Object.keys(cursorAccumulator).sort((a, b) => cursorAccumulator[a].value - cursorAccumulator[b].value);

            for (let i = sorted.length - 1; i > -1; i --) {
                const req = cursorAccumulator[sorted[i]];

                const tr = document.createElement(`tr`);

                const requester = document.createElement(`td`);
                tr.append(requester);

                const requesterView = document.createElement(`button`);
                requesterView.className = `btn btn-sm btn-primary mr-1`;
                requesterView.textContent = `View`;
                requesterView.addEventListener(`click`, async (event) => {
                    document.getElementById(`view`).value = ``;
                    document.getElementById(`matching`).value = req.id;
                    document.getElementById(`date-from`).value = ``;
                    document.getElementById(`date-to`).value = ``;
                    search();
                });
                requester.appendChild(requesterView);

                const requesterLink = document.createElement(`a`);
                requesterLink.href = `https://worker.mturk.com/requesters/${req.id}/projects`;
                requesterLink.target = `_blank`;
                requesterLink.textContent = req.name;
                requester.appendChild(requesterLink);

                const count = document.createElement(`td`);
                count.textContent = req.count;
                tr.appendChild(count);

                const value = document.createElement(`td`);
                value.textContent = req.value.toMoneyString();
                tr.appendChild(value);

                results.appendChild(tr);
            }
        }
    }

    transaction.oncomplete = (event) => {
        const tr = document.createElement(`tr`);
        tr.className = `bg-primary text-white`;

        const requester = document.createElement(`td`);
        requester.textContent = `Requester`;
        tr.append(requester);

        const count = document.createElement(`td`);
        count.textContent = `HITs`;
        tr.appendChild(count);

        const value = document.createElement(`td`);
        value.textContent = `Reward`;
        tr.appendChild(value);

        results.prepend(tr);

        return statusEnd();
    };
}

async function dailyOverview() {
    searchStart();

    const results = document.getElementById(`history-results`);
    const dateTo = document.getElementById(`date-to`).value;
    const dateFrom = document.getElementById(`date-from`).value;

    const transaction = hitTrackerDB.transaction([`day`], `readonly`);
    const objectStore = transaction.objectStore(`day`);

    if (dateTo || dateFrom) {
        const days = [];

        objectStore.openCursor(IDBKeyRange.bound(dateFrom.replace(/-/g, ``) || `0`, dateTo.replace(/-/g, ``) || `99999999`)).onsuccess = (event) => {
            const cursor = event.target.result;

            if (cursor) {
                days.push(cursor.value);
                return cursor.continue();
            }
            else {
                return process(days);
            }
        };
    }
    else {
        objectStore.getAll().onsuccess = (event) => {
            const hits = event.target.result;
            return process(event.target.result);
        }
    }


    transaction.oncomplete = (event) => {
        const th = document.createElement(`tr`);
        th.className = `bg-primary text-white`;

        const date = document.createElement(`td`);
        date.textContent = `Date`;
        th.appendChild(date);

        const submitted = document.createElement(`td`);
        submitted.textContent = `Submitted`;
        th.appendChild(submitted);

        const approved = document.createElement(`td`);
        approved.textContent = `Approved`;
        th.appendChild(approved);

        const rejected = document.createElement(`td`);
        rejected.textContent = `Rejected`;
        th.appendChild(rejected);

        const pending = document.createElement(`td`);
        pending.textContent = `Pending`;
        th.appendChild(pending);

        const ret_aban = document.createElement(`td`);
        ret_aban.textContent = `Returned/Abandoned`;
        th.appendChild(ret_aban);

        const earningsHits = document.createElement(`td`);
        earningsHits.textContent = `Earnings HITs`;
        th.appendChild(earningsHits);

        results.prepend(th);

        return searchEnd();
    }

    function process(days) {
        while (results.firstChild) {
            results.removeChild(results.firstChild);
        }

        for (const day of days) {
            const tr = document.createElement(`tr`);
            const formattedDate = [day.date.slice(0, 4), day.date.slice(4,6), day.date.slice(6,8)].join(`-`);

            const date = document.createElement(`td`);
            date.textContent = formattedDate;
            tr.appendChild(date);

            const submitted = document.createElement(`td`);
            submitted.textContent = day.submitted + day.rejected + day.approved + day.paid;
            tr.appendChild(submitted);

            const approved = document.createElement(`td`);
            approved.textContent = day.approved + day.paid;
            tr.appendChild(approved);

            const rejected = document.createElement(`td`);
            rejected.textContent = day.rejected;
            tr.appendChild(rejected);

            const pending = document.createElement(`td`);
            pending.textContent = day.submitted;
            tr.appendChild(pending);

            const ret_aban = document.createElement(`td`);
            ret_aban.textContent = day.returned + day.abandoned;
            tr.appendChild(ret_aban);

            const earningsHits = document.createElement(`td`);
            earningsHits.textContent = day.earnings.toMoneyString();
            tr.appendChild(earningsHits);

            const actions = document.createElement(`span`);
            date.prepend(actions);

            const viewThisDay = document.createElement(`button`);
            viewThisDay.className = `btn btn-sm btn-primary mr-1`;
            viewThisDay.textContent = `View`;
            viewThisDay.addEventListener(`click`, async (event) => {
                document.getElementById(`view`).value = ``;
                document.getElementById(`matching`).value = ``;
                document.getElementById(`date-from`).value = formattedDate;
                document.getElementById(`date-to`).value = formattedDate;
                search();
            });
            actions.appendChild(viewThisDay);

            const syncThisDay = document.createElement(`button`);
            syncThisDay.className = `btn btn-sm btn-primary mr-1`;
            syncThisDay.textContent = `Sync`;
            syncThisDay.addEventListener(`click`, async (event) => {
                await syncDay(day.date);
                const classList = event.target.parentElement.parentElement.parentElement.classList;
                classList.add(`bg-warning`);
                classList.add(`text-white`);
            });
            actions.appendChild(syncThisDay);

            if (!day.day || day.day.submitted !== (day.submitted + day.rejected + day.approved + day.paid)) {
                syncThisDay.classList.add(`btn-warning`);
            }

            results.prepend(tr);
        }
    }
}

async function search() {
    searchStart();

    const view = document.getElementById(`view`).value;
    const matching = document.getElementById(`matching`).value;
    const matchingType = document.getElementById(`matching-type`).value;
    const dateTo = document.getElementById(`date-to`).value;
    const dateFrom = document.getElementById(`date-from`).value;

    const transaction = hitTrackerDB.transaction([`hit`], `readonly`);
    const objectStore = transaction.objectStore(`hit`);
    let request;

    if (dateFrom || dateTo) {
        const index = objectStore.index(`date`);
        request = index.openCursor(IDBKeyRange.bound(dateFrom.replace(/-/g, ``) || `0`, dateTo.replace(/-/g, ``) || `99999999`));
    }
    else if (view) {
        const index = objectStore.index(`state`);
        request = index.openCursor(IDBKeyRange.only(view));
    }
    else {
        const index = objectStore.index(`state`);
        request = index.openCursor();
    }

    let count = 0;

    const results = document.getElementById(`history-results`);

    while (results.firstChild) {
        results.removeChild(results.firstChild);
    }

    const fragment = document.createDocumentFragment();

    request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
            searchingUpdate(`Processing HIT ${++ count}`);

            const value = cursor.value;

            if (matching) {
                const hitValues = [value.requester_id, value.requester_name, value.title];

                if (matchingType === `contain`) {
                    let contains = false;

                    for (const item of hitValues) {
                        if (item && ~item.toLowerCase().indexOf(matching.toLowerCase())) {
                            contains = true;
                            break;
                        }
                    }

                    if (!contains) {
                        return cursor.continue();
                    }
                }
                else if (!hitValues.includes(matching)) {
                    return cursor.continue(); 
                }
            }

            if (view && view !== value.state) {
                return cursor.continue();
            }

            const tr = document.createElement(`tr`);

            const date_accepted = document.createElement(`td`);
            date_accepted.textContent = [value.date.slice(0, 4), value.date.slice(4,6), value.date.slice(6,8)].join(`-`);
            tr.appendChild(date_accepted)

            const requester_name = document.createElement(`td`);
            requester_name.textContent = value.requester_name;
            tr.appendChild(requester_name);

            const title = document.createElement(`td`);
            title.textContent = value.title;
            tr.appendChild(title);

            if (value.source) {
                const viewSource = document.createElement(`a`);
                viewSource.href = value.source;
                viewSource.target = `_blank`;
                viewSource.className = `btn btn-sm btn-primary mr-1`;
                viewSource.textContent = `Src`;
                title.prepend(viewSource);

                if (value.answer) {
                    viewSource.title = Object.keys(value.answer).reduce((a, cV) => a += `<b>${cV}</b>: ${value.answer[cV]} <br>`, ``);

                    viewSource.dataset.html = `true`;
                    viewSource.dataset.toggle = `tooltip`;
                }
            }

            const reward = document.createElement(`td`);
            reward.textContent = value.reward.amount_in_dollars.toMoneyString();
            tr.appendChild(reward);

            const state = document.createElement(`td`);
            state.textContent = value.state;
            tr.appendChild(state);

            fragment.appendChild(tr);

            return cursor.continue();
        }
    };

    transaction.oncomplete = (event) => {
        const th = document.createElement(`tr`);
        th.className = `bg-primary text-white`;

        const date_accepted = document.createElement(`td`);
        date_accepted.textContent = `Date`;
        th.appendChild(date_accepted);

        const requester_name = document.createElement(`td`);
        requester_name.textContent = `Name`;
        th.appendChild(requester_name);

        const title = document.createElement(`td`);
        title.textContent = `Title`;
        th.appendChild(title);

        const reward = document.createElement(`td`);
        reward.textContent = `Reward`;
        th.appendChild(reward);

        const state = document.createElement(`td`);
        state.textContent = `Status`;
        th.appendChild(state);

        $(`[data-toggle="tooltip"]`).tooltip();

        results.appendChild(th);
        results.appendChild(fragment);

        return searchEnd();
    }
}

function searchStart() {
    const modal = document.getElementById(`searching-modal`);
    searchingUpdate(`This may take some time`);

    $(modal).modal({
        backdrop: `static`,
        keyboard: false
    });
}

function searchingUpdate(message) {
    document.getElementById(`searching-message`).textContent = message ? message : null;
}

function searchEnd() {
    const modal = document.getElementById(`searching-modal`);

    $(modal).modal(`hide`);
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

speechSynthesis.getVoices();

function textToSpeech(phrase) {
    const message = new SpeechSynthesisUtterance(phrase);
    message.voice = speechSynthesis.getVoices().filter((voice) => voice.name == `Google US English`)[0];
    window.speechSynthesis.speak(message);
}



document.getElementById(`import`).addEventListener(`click`, (event) => document.getElementById(`import-file`).click());
document.getElementById(`import-file`).addEventListener(`change`, (event) => trackerImport(event.target.files[0]));
document.getElementById(`export`).addEventListener(`click`, (event) => trackerExport());


function trackerImport(file) {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = async (event) => {
        try {
            statusStart({
                header: `Importing`,
                message: `Importing backup`
            });

            const json = JSON.parse(event.target.result);

            if (json.hits && json.days) {
                await trackerImportPutHit(json.hits);
                await trackerImportPutDay(json.days);
            }
            else if (json.STATS && json.HIT) {
                const hits = json.HIT.reduce((accumulator, currentValue) => {
                    accumulator.push({
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
                    });

                    return accumulator;
                }, []);

                const days = json.STATS.reduce((accumulator, currentValue) => {
                    if (currentValue.earnings !== undefined) {
                        accumulator.push({
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
                        });
                    }
                    else {
                        statusEnd();
                        return alert(`Import failed! Error importing day: ${JSON.stringify(currentValue)}`);
                    }

                    return accumulator;
                }, []);

                await trackerImportPutHit(hits);
                await trackerImportPutDay(days);
                statusEnd();
            }
            else {
                statusEnd();
                return alert(`Import failed! Unrecognized format`);
            }
        }
        catch (error) {
            statusEnd();
            return alert(`Import failed! ${error}`);
        }
    }
}

function trackerImportPutHit(hits) {
    statusUpdate({ message: `Putting HITs` });

    return new Promise((resolve) => {
        const transaction = hitTrackerDB.transaction([`hit`], `readwrite`);
        const objectStore = transaction.objectStore(`hit`);

        let count = 0, length = hits.length;
        
        for (const hit of hits) {
            statusUpdate({ message: `Putting HIT ${++ count} of ${length}` });
            
            if (hit.hit_id && hit.requester_id) {
                if (hit.state !== `Paid`) {
                    objectStore.put(paidAfter30(hit));
                }
                else {
                    objectStore.put(hit);
                }
            }
        }

        transaction.oncomplete = (event) => {
            return resolve();
        };
    });
}

function trackerImportPutDay(days) {
    statusUpdate({ message: `Putting Days` });

    return new Promise(async (resolve) => {
        const transaction = hitTrackerDB.transaction([`day`], `readwrite`);
        const objectStore = transaction.objectStore(`day`);

        let count = 0, length = days.length;
        
        for (const day of days) {
            statusUpdate({ message: `Putting Day ${++ count} of ${length}` });
            
            if (day.day && day.day.earnings && day.date) {
                objectStore.put(day);
            }
        }

        transaction.oncomplete = async (event) => {
            const dates = days.reduce((accumulator, currentValue) => {
                accumulator.push(currentValue.date);
                return accumulator;
            }, []);

            for (const date of dates) {
                await saveDay(date);
            }

            return resolve();
        };
    });
}

async function trackerExport() {
    const exportFile = document.getElementById(`export-file`);

    const data = JSON.stringify({
        hits: await trackerExportGetHit(),
        days: await trackerExportGetDay()
    });

    exportFile.href = window.URL.createObjectURL(new Blob([data], { type: `application/json` }));
    exportFile.download = `HIT_Tracker_Backup_${mturkDate()}.json`;
    exportFile.click();
}

function trackerExportGetHit() {
    return new Promise((resolve) => {
        const transaction = hitTrackerDB.transaction([`hit`], `readonly`);
        const objectStore = transaction.objectStore(`hit`);

        objectStore.getAll().onsuccess = (event) => {
            resolve(event.target.result);
        }
    });

}

function trackerExportGetDay() {
    return new Promise((resolve) => {
        const transaction = hitTrackerDB.transaction([`day`], `readonly`);
        const objectStore = transaction.objectStore(`day`);

        objectStore.getAll().onsuccess = (event) => {
            resolve(event.target.result);
        }
    });
}

function statusStart(opts) {
    const statusModal = document.getElementById(`status-modal`);
    const statusHeader = document.getElementById(`status-header`);
    const statusMessage = document.getElementById(`status-message`);

    if (opts.header) {
        statusHeader.textContent = opts.header;
    }

    if (opts.message) {
        statusMessage.textContent = opts.message;
    }

    $(statusModal).modal({
        backdrop: `static`,
        keyboard: false
    });
}

function statusUpdate(opts) {
    const statusModal = document.getElementById(`status-modal`);
    const statusHeader = document.getElementById(`status-header`);
    const statusMessage = document.getElementById(`status-message`);

    if (opts.header) {
        statusHeader.textContent = opts.header;
    }

    if (opts.message) {
        statusMessage.textContent = opts.message;
    }
}

function statusEnd() {
    const statusModal = document.getElementById(`status-modal`);
    const statusHeader = document.getElementById(`status-header`);
    const statusMessage = document.getElementById(`status-message`);

    statusHeader.textContent = ``;
    statusMessage.textContent = ``;

    $(statusModal).modal(`hide`);
}

function paidAfter30(hit) {
    const isAfter30 = new Date(formatDate(hit.date)).getTime();
    const whenAfter30 = new Date(formatDate(mturkDate())).getTime() - (31 * 24 * 60 * 60 * 1000);

    if (isAfter30 < whenAfter30) {
        hit.state = `Paid`;
    }

    return hit;
}

function formatDate(date) {
    return [date.slice(0, 4), date.slice(4,6), date.slice(6,8)].join(`-`);
}




















































