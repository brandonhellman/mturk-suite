(async () => {
    const react = await require(`reactComponents/common/CopyText`);

    chrome.storage.local.set({
        workerId: react.reactProps.textToCopy
    });
})();