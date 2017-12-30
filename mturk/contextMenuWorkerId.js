(async () => {
    const react = await require(`reactComponents/common/CopyText`);

    chrome.storage.local.set({
        workerID: react.reactProps.textToCopy
    });
})();