(async () => {
    await ready({ enabled: `hitDetailsEnhancer` });

    const react = await require(`reactComponents/common/ShowModal`);
    const react2 = await require(`reactComponents/modal/MTurkWorkerModal`);

    const details = react.element.closest(`.project-detail-bar`).firstElementChild.lastElementChild.firstElementChild;
    details.firstElementChild.className = `col-xs-4 text-xs-center col-md-4 text-md-center`;
    details.lastElementChild.className = `col-xs-4 text-xs-center col-md-4 text-md-right`;

    const available = document.createElement(`div`);
    available.className = `col-xs-4 text-xs-center col-md-4 text-md-center`;

    const availableLabel = document.createElement(`span`);
    availableLabel.className = `detail-bar-label`;
    availableLabel.textContent = `HITs: `;
    available.appendChild(availableLabel);

    const availableValue = document.createElement(`span`);
    availableValue.className = `detail-bar-value`;
    availableValue.textContent = react.reactProps.modalOptions.assignableHitsCount;
    available.appendChild(availableValue);

    details.insertBefore(available, details.lastElementChild);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const addedNode = mutation.addedNodes[0];

            if (addedNode.matches(`#modalProjectDetailsModal`) === true) {
                const requester = addedNode.querySelector(`[data-reactid=".8.0.0.1.0.0.1"]`);

                const link = document.createElement(`a`);
                link.href = `https://worker.mturk.com/requesters/${react.reactProps.modalOptions.contactRequesterUrl.match(/requesterId=(\w+)/)[1]}/projects`;
                link.target = `_blank`;
                link.textContent = react.reactProps.modalOptions.requesterName;

                requester.replaceWith(link);
            }
        });
    });

    observer.observe(react2.element, { childList: true });

    await ready({ document: `complete` });

    react.element.firstChild.textContent = react.reactProps.modalOptions.requesterName;
})();
