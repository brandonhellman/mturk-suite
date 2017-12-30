(async () => {
    await ready({ enabled: `blockListOnMturk` });

    const blockList = await new Promise((resolve) => chrome.storage.local.get([`blockList`], (item) => resolve(item.blockList)));

    if (blockList) {
        const react = await require(`reactComponents/hitSetTable/HitSetTable`);

        const blocked = react.reactProps.bodyData.reduce((accumulator, currentValue, currentIndex) => {
            if (blockListed(currentValue)) {
                accumulator.push(currentIndex);
            }
            return accumulator;
        }, []);

        const length = blocked.length;

        if (length) {
            await ready({ document: `complete` });

            const hits = react.element.getElementsByClassName(`hit-set-table-row`);

            for (const i of blocked) {
                const hit = hits[i];
                hit.classList.add(`blocked`);
                hit.style.display = `none`;
            }

            const toggle = document.createElement(`span`);
            toggle.className = `expand-projects-button`;
            toggle.addEventListener(`click`, (event) => {
                for (const i of blocked) {
                    const hit = hits[i];
                    hit.style.display = hit.style.display === `none` ? `` : `none`;
                }
                
                icon.classList.toggle(`fa-plus-circle`);
                icon.classList.toggle(`fa-minus-circle`);
                text.textContent = `${~text.textContent.indexOf(`Show`) ? `Hide` : `Show`} Blocked (${length})`;
            });

            const link = document.createElement(`a`);
            link.href = `#`;
            link.className = `table-expand-collapse-button`;
            toggle.appendChild(link);

            const icon = document.createElement(`i`);
            icon.className = `fa fa-plus-circle`;
            link.appendChild(icon);

            const text = document.createElement(`span`);
            text.className = `button-text`;
            text.textContent = `Show Blocked (${length})`;
            link.appendChild(text);

            document.getElementsByClassName(`expand-collapse-projects-holder`)[0].prepend(toggle);
        }
    }

    function blockListed(hit) {
        const check = [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title];
        const checkLowerCase = check.map((currentValue) => currentValue.toLowerCase());

        for (const match in blockList) {
            const bl = blockList[match];

            if (bl.strict) {
                if (check.includes(match)) {
                    return true;
                }
            }
            else {
                const matchLowerCase = match.toLowerCase();

                for (const value of checkLowerCase) {
                    if (~value.indexOf(matchLowerCase)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
})();
