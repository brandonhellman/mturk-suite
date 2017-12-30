(async () => {
    await ready({ enabled: `autoAcceptChecker` });

    const react = await require(`reactComponents/workPipeline/AutoAcceptCheckbox`);

    await ready({ document: `complete` });

    const checkbox = react.element.getElementsByTagName(`input`)[0];

    if (checkbox.checked === false) {
        checkbox.click();
    }
})();