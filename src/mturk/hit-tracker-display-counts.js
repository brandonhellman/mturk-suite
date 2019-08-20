function hitTrackerIcon(response, title) {
  const keys = Object.keys(response);
  const { Approved, Paid, Rejected } = response;

  if (keys.length) {
    const span = document.createElement(`span`);
    span.className = `m-r-xs fa fa-question text-muted`;

    if (Approved || Paid) span.className = `m-r-xs fa fa-check text-success`;
    else if (Rejected) span.className = `m-r-xs fa fa-exclamation text-danger`;

    const content = keys
      .map(key => HTML`<div class="row">${key}: ${response[key]}</div>`)
      .join(``);

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
    span.appendChild(script);

    return span;
  }

  return undefined;
}

async function hitTrackerDisplayCounts() {
  const [dom, props] = await Promise.all([
    ReactDOM(`HitSetTable`, `TaskQueueTable`),
    ReactProps(`HitSetTable`, `TaskQueueTable`),
    Enabled(`hitTrackerDisplayCounts`)
  ]);

  [...dom.getElementsByClassName(`table-row`)].forEach((row, i) => {
    const json = props.bodyData[i].project || props.bodyData[i];
    const { requester_id, requester_name, title } = json;

    const reqMsg = { trackerGetCounts: { requester_id } };
    const titleMsg = { trackerGetCounts: { title } };

    chrome.runtime.sendMessage(reqMsg, response => {
      const el = row.querySelector(`a[href^="/requesters/"]`);
      const icon = hitTrackerIcon(
        response,
        HTML`${requester_name} [${requester_id}]`
      );

      if (icon) el.insertAdjacentElement(`beforebegin`, icon);
    });

    chrome.runtime.sendMessage(titleMsg, response => {
      const el = row.querySelector(`.project-name-column`);
      const icon = hitTrackerIcon(response, HTML`${title}`);

      if (icon) {
        const insert = el.children[el.children.length - 1];
        insert.insertAdjacentElement(`afterend`, icon);
      }
    });
  });
}

hitTrackerDisplayCounts();
