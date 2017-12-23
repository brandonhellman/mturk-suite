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