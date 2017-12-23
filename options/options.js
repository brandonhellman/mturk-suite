const storage = new Object();

function storageExports(string) {
    storage.exports = string;

    document.getElementById(string).checked = true;
    
    document.getElementById(`hit-exporter`).addEventListener(`change`, (e) => {
        storage.exports = e.target.id;

        chrome.storage.local.set({
            exports: storage.exports
        });
    });
}

function storageReviews(object) {
    storage.reviews = object;

    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            const element = document.getElementById(key);

            if (element !== null) {
                element.checked = object[key];
            }
        }
    }
    
    document.getElementById(`requester-reviews`).addEventListener(`change`, (e) => {
        storage.reviews[e.target.id] = e.target.checked;

        chrome.storage.local.set({
            reviews: storage.reviews
        });
    });
}

function storageScripts(object) {
    storage.scripts = object;

    for (const key in object) {
        if (object.hasOwnProperty(key)) {            
            const element = document.getElementById(key);

            if (element !== null) {
                element.checked = object[key];
            }
        }
    }

    if (object.hitExporter === true) {
        document.getElementById(`hit-exporter`).hidden = false;
    }
    
    if (object.requesterReviews === true) {
        document.getElementById(`requester-reviews`).hidden = false;
    }

    document.getElementById(`scripts`).addEventListener(`change`, (e) => {
        storage.scripts[e.target.id] = e.target.checked;

        if (e.target.id === `hitExporter`) {
            document.getElementById(`hit-exporter`).hidden = !document.getElementById(`hit-exporter`).hidden 
        }

        if (e.target.id === `requesterReviews`) {
            document.getElementById(`requester-reviews`).hidden = !document.getElementById(`requester-reviews`).hidden;
        }

        chrome.storage.local.set({
            scripts: storage.scripts
        });
    });
}

function storageThemes(object) {
    storage.themes = object;

    const theme = document.getElementById(`theme`);
    const themes = document.getElementById(`themes`);
    const themesMts = document.getElementById(`themes-mts`);
    const themesMturk = document.getElementById(`themes-mturk`);

    theme.href = `/bootstrap/css/${storage.themes.mts}.min.css`;
    themesMts.value = storage.themes.mts;

    themes.addEventListener(`change`, (e) => {
        storage.themes.mts = themesMts.value;
        storage.themes.mturk = themesMturk.value;

        theme.href = `/bootstrap/css/${storage.themes.mts}.min.css`;

        chrome.storage.local.set({
            themes: storage.themes
        });
    });
}

chrome.storage.local.get([`exports`, `reviews`, `scripts`, `themes`], (keys) => {
    storageExports(keys.exports);
    storageReviews(keys.reviews);
    storageScripts(keys.scripts);
    storageThemes(keys.themes);
});

$(`[data-toggle="tooltip"]`).tooltip();
