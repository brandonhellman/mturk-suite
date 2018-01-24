(function getVersion() {
    document.getElementById(`version`).textContent = `v${chrome.runtime.getManifest().version}`;
})();

(function checkForUpdateAvailable() {
    chrome.runtime.sendMessage({ checkForUpdateAvailable: true }, (response) => {
        if (response) {
            while (document.body.firstChild) {
                document.body.removeChild(document.body.firstChild);
            }

            const update = document.createElement(`button`);
            update.className = `btn btn-success w-100 h-100 text-center`;
            update.textContent = `Apply Update`;
            update.addEventListener(`click`, (event) => {
                chrome.runtime.reload();
            });
            document.body.appendChild(update);
        }
    });
})();