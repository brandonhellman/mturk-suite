(async () => {
    await ready({ enabled: `hitTracker` });

    const react = await require(`reactComponents/hitSetTable/HitSetTable`, `reactComponents/taskQueueTable/TaskQueueTable`);
    const reactProps = react.reactProps;

    const trackerCompareValues = reactProps.bodyData ? reactProps.bodyData.reduce((accumulator, currentValue) => {
        const project = currentValue.project || currentValue;

        for (const prop of [`requester_id`, `title`]) {
            if (!accumulator[prop]) {
                accumulator[prop] = [project[prop]];
            }
            else if (!accumulator[prop].includes(project[prop])) {
                accumulator[prop].push(project[prop]);
            }
        }

        return accumulator;
    }, {}) : [reactProps.modalOptions.contactRequesterUrl, reactProps.modalOptions.projectTitle];

    const counts = await sendMessage({
        function: `hitTrackerGetCounts`,
        arguments: trackerCompareValues
    });

    function countPopover(counts) {
        let template = ``;

        for (const key in counts) {
            template += `<div class="row">${key}: ${counts[key]}</div>`
        }

        return template === `` ? `No Work Found` : template;
    }

    await ready ({ document: `complete` });

    const hitRows = react.element.getElementsByClassName(`table-row`);

    for (let i = 0; i < hitRows.length; i ++) {
        const hit = reactProps.bodyData[i].project || reactProps.bodyData[i];
        const trackerR = counts[hit.requester_id];
        const trackerT = counts[hit.title];

        const appR = trackerR.Paid || trackerR.Approved;
        const rejR = trackerR.Rejected;
        const lenR = Object.keys(trackerR).length;

        const requester = document.createElement(`span`);
        requester.className = `btn btn-sm fa ${appR ? `fa-check btn-success` : rejR ? `fa-exclamation btn-info` : `fa-${lenR ? `question` : `minus`} btn-secondary`}`;
        requester.style.marginRight = `5px`;

        const requesterScript = document.createElement(`script`);
        requesterScript.textContent = `$(document.currentScript).parent().popover({ html: true, trigger: 'hover', title: '${hit.requester_name} [${hit.requester_id}]', content: '<div class="container">${countPopover(trackerR)}</div>' });`;
        requester.appendChild(requesterScript);

        const requesterEl = hitRows[i].querySelector(`a[href^="/requesters/"]`);
        requesterEl.parentElement.insertBefore(requester, requesterEl);

        const appT = trackerT.Paid  || trackerT.Approved;
        const rejT = trackerT.Rejected;
        const lenT = Object.keys(trackerT).length;

        const title = document.createElement(`span`);
        title.className = `btn btn-sm fa ${appT ? `fa-check btn-success` : rejT ? `fa-exclamation btn-info` : `fa-${lenT ? `question` : `minus`} btn-secondary`}`;
        title.style.marginRight = `5px`;

        const titleScript = document.createElement(`script`);
        titleScript.textContent = `$(document.currentScript).parent().popover({ html: true, trigger: 'hover', title: '${hit.title}', content: '<div class="container">${countPopover(trackerT)}</div>' });`;
        title.appendChild(titleScript);

        const titleEl = hitRows[i].getElementsByClassName(`project-name-column`)[0].lastChild;
        titleEl.parentElement.insertBefore(title, titleEl)
    }

    const style = document.createElement(`style`);
    style.innerHTML = `.popover { max-width: 1000px; }`;
    document.head.appendChild(style);
})();