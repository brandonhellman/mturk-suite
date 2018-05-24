async function hitTrackerDisplayCounts() {
  function setIcon(response, icon) {
    const { Approved, Paid, Rejected } = response;
    const { classList } = icon;

    if (Approved || Paid) {
      classList.add(`text-success`);
      classList.replace(`fa-ellipsis-h`, `fa-check`);
    } else if (Rejected) {
      classList.add(`text-info`);
      classList.replace(`fa-ellipsis-h`, `fa-exclamation`);
    } else {
      classList.add(`text-muted`);
      classList.replace(
        `fa-ellipsis-h`,
        `fa-${Object.keys(response).length ? `question` : `minus`}`
      );
    }
  }

  function setPopover(response, icon, title) {
    const content =
      Object.keys(response)
        .map(key => `<div class="row">${key}: ${response[key]}</div>`)
        .join(``) || `No Work Found`;

    const script = document.createElement(`script`);
    script.textContent = `$(document.currentScript).parent().popover({
      html: true,
      trigger: 'hover',
      delay:  { 
        show: 500, 
        hide: 100
      },
      title: '${title}',
      content: '<div class="container">${content}</div>'
    });`;
    icon.appendChild(script);
  }

  const [dom, props] = await Promise.all([
    ReactDOM(`HitSetTable`, `TaskQueueTable`),
    ReactProps(`HitSetTable`, `TaskQueueTable`),
    Enabled(`hitTrackerDisplayCounts`)
  ]);

  [...dom.getElementsByClassName(`table-row`)].forEach((row, i) => {
    const json = props.bodyData[i].project || props.bodyData[i];
    const { requester_id, requester_name, title } = json;

    const requesterEl = row.querySelector(`a[href^="/requesters/"]`);
    requesterEl.insertAdjacentHTML(
      `beforebegin`,
      // eslint-disable-next-line camelcase
      HTML`<span class="m-r-xs fa fa-ellipsis-h" data-hit-tracker-requester_id="${requester_id}" style="font-size: 12px;"></span>`
    );

    const titleEl = row.querySelector(`.project-name-column`);
    titleEl.children[titleEl.children.length - 1].insertAdjacentHTML(
      `afterend`,
      HTML`<span class="m-r-xs fa fa-ellipsis-h" data-hit-tracker-title="${title}"></span>`
    );

    chrome.runtime.sendMessage(
      { trackerGetCounts: { requester_id } },
      response => {
        const icon = row.querySelector(`[data-hit-tracker-requester_id]`);
        setIcon(response, icon);
        // eslint-disable-next-line camelcase
        setPopover(response, icon, HTML`${requester_name} [${requester_id}]`);
      }
    );

    chrome.runtime.sendMessage({ trackerGetCounts: { title } }, response => {
      const icon = row.querySelector(`[data-hit-tracker-title]`);
      setIcon(response, icon);
      setPopover(response, icon, HTML`${title}`);
    });
  });
}

hitTrackerDisplayCounts();
