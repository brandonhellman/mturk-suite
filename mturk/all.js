(function updateTheme() {
    chrome.storage.local.get([`themes`], (keys) => {        
        if (keys.themes.mturk !== `default`) {
            const el = document.getElementById(`mturk-theme`);
            const href = chrome.extension.getURL(`bootstrap/css/${keys.themes.mturk}.worker.css`);

            if (el) {
                el.href = href
            }
            else {
                const theme = document.createElement(`link`);
                theme.id = `mturk-theme`;
                theme.rel = 'stylesheet';
                theme.href = href;
                theme.type = `text/css`;
                (document.head||document.documentElement).appendChild(theme);
            }
        }

        chrome.storage.onChanged.addListener((changes) => {
            if (changes.themes) {
                const el = document.getElementById(`mturk-theme`);
                const href = chrome.extension.getURL(`bootstrap/css/${changes.themes.newValue.mturk}.worker.css`);

                if (el) {
                    el.href = href
                }
                else {
                    const theme = document.createElement(`link`);
                    theme.id = `mturk-theme`;
                    theme.rel = `stylesheet`;
                    theme.href = href;
                    theme.type = `text/css`;
                    document.getElementsByTagName(`head`)[0].appendChild(theme);
                }
            }
        });
    });
})();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.hitMissed) {
        hitMissed(request.hitMissed);
    }
});

const storage = new Object;

(async () => {
    const items = await new Promise((resolve) => chrome.storage.local.get([`earnings`, `exports`, `reviews`, `scripts`], resolve));
    Object.keys(items).forEach((currentValue) => storage[currentValue] = items[currentValue]);
})();

function ready(object) {
    return new Promise(async (resolve) => {
        try {
            if (object instanceof Object) {
                const promises = [];

                if (typeof object.enabled === `string`) {
                    const promiseEnabled = new Promise(async (resolve, reject) => {
                        await new Promise((resolve) => {
                            (function checkStorageScripts() {
                                if (storage.scripts instanceof Object) {
                                    return resolve();
                                } else {
                                    setTimeout(checkStorageScripts, 1);
                                }
                            })();
                        });

                        if (storage.scripts[object.enabled] === true) {
                            return resolve();
                        } else {
                            return reject(`Not enabled: ${object.enabled}`);
                        }
                    });

                    promises.push(promiseEnabled);
                }

                if (typeof object.document === `string`) {                    
                    const promiseReady = new Promise((resolve) => {
                        if (document.readyState === object.document || document.readyState === `complete`) {
                            return resolve();
                        } else {
                            document.addEventListener(`readystatechange`, (event) => {
                                if (event.target.readyState === object.document) {
                                    return resolve();
                                }
                            });
                        }
                    });

                    promises.push(promiseReady);
                }

                if (object.matches instanceof Array) {
                    const promiseMatches = new Promise((resolve, reject) => {
                        for (const item of object.matches) {
                            const regex = new RegExp(`https:\/\/worker\.mturk\.com${item.replace(/\*/g, `[^ ]*`)}`);

                            if (window.location.href.match(regex)) {
                                return resolve();
                            }
                        }
                        return reject(`Not matched: ${object.enabled ? object.enabled : object.matches.join(` `)}`);
                    });

                    promises.push(promiseMatches);
                }

                await Promise.all(promises);

                return resolve();
            }
        } catch (error) {}
    });
}

function require() {
    return new Promise(async (resolve) => {
        try {
            await ready({
                document: `interactive`
            });

            for (const value of arguments) {
                const element = document.querySelector(`[data-react-class="require('${value}')['default']"]`) || document.querySelector(`[data-react-class="require('${value}')['PureAlert']"]`);

                if (element !== null) {
                    return resolve({
                        element: element,
                        reactProps: JSON.parse(element.dataset.reactProps)
                    });
                }
            }

            throw `Could not resolve require('${arguments}') `;
        } catch (error) {}
    });
}

function sendMessage(object) {
    return new Promise((resolve) => chrome.runtime.sendMessage(object, resolve));
}

async function hitMissed(hit_set_id) {
    await ready({ document: `complete` });
    const react = await require(`reactComponents/alert/Alert`);

    const once = document.createElement(`button`);
    once.className = `btn btn-primary`;
    once.textContent = `Once`;
    once.style.marginLeft = `5px`;
    once.addEventListener(`click`, (event) => {
        chrome.runtime.sendMessage({
            hitCatcher: {
                id: hit_set_id, 
                name: ``,
                once: true,
                sound: true
            }
        });
    });
    react.element.getElementsByTagName(`h3`)[0].appendChild(once);

    const panda = document.createElement(`button`);
    panda.className = `btn btn-primary`;
    panda.textContent = `Panda`;
    panda.style.marginLeft = `5px`;
    panda.addEventListener(`click`, (event) => {
        chrome.runtime.sendMessage({
            hitCatcher: {
                id: hit_set_id, 
                name: ``,
                once: false,
                sound: false
            }
        });
    });
    react.element.getElementsByTagName(`h3`)[0].appendChild(panda);
}

Object.assign(Number.prototype, {
    toMoneyString() {
        return `$${this.toFixed(2).toLocaleString(`en-US`, { minimumFractionDigits: 2 })}`;
    }
});

chrome.runtime.sendMessage({ hitCatcher: `loggedIn` });
