async function HIT_EXPORTER() {
  // Returns a script to be injected that uses the pages Bootstrap to make a popover.
  // Popoover contains the HIT Exporter buttons for it's HIT.
  function popover(hit) {
    const id = hit.hit_set_id;
    const title = `HIT Exporter <span style="font-size: 8px;">[${id}]</span>`;
    const content =
      `<div style="display: flex; flex-flow: row wrap; justify-content: space-around; width: 250px;">` +
      `<button class="btn btn-primary btn-sm btn-hit-exporter" style="width: 75px; margin-bottom: 3px;" data-id="${id}" data-type="short">Short</button>` +
      `<button class="btn btn-primary btn-sm btn-hit-exporter" style="width: 75px; margin-bottom: 3px;" data-id="${id}" data-type="plain">Plain</button>` +
      `<button class="btn btn-primary btn-sm btn-hit-exporter" style="width: 75px; margin-bottom: 3px;" data-id="${id}" data-type="markdown">Markdown</button>` +
      `<button class="btn btn-primary btn-sm btn-hit-exporter" style="width: 75px;" data-id="${id}" data-type="bbcode">BBCode</button>` +
      `<button class="btn btn-primary btn-sm btn-hit-exporter" style="width: 75px;" data-id="${id}" data-type="turkerhub">Turker Hub</button>` +
      `<button class="btn btn-primary btn-sm btn-hit-exporter" style="width: 75px;" data-id="${id}" data-type="mturkcrowd">MTurk Crowd</button>` +
      `</div>`;

    const script = document.createElement(`script`);
    script.textContent = `$(document.currentScript).parent().popover({html: true, trigger: 'focus', contiainer: 'body', title: '${title}', content: '${content}'});`;
    return script;
  }

  // Changes the color of the exported HIT's button.
  function markExport(response) {
    const { id, success } = response;

    const button = document.getElementById(`hit-exporter-${id}`);
    button.classList.remove(`btn-primary`);
    button.classList.remove(`btn-success`);
    button.classList.remove(`btn-danger`);
    button.classList.add(`btn-${success ? `success` : `danger`}`);
  }

  // Sends the HIT to the background to be copied in the selected export.
  function copyExport(type, id, hits) {
    const hit = hits[id];
    chrome.runtime.sendMessage({ hit, hitExporter: type }, markExport);
  }

  // Confirms before sending the HIT directly to the selected forum with a message if provided.
  function directExport(type, id, hits) {
    const hit = hits[id];
    const domain = type === `turkerhub` ? `TurkerHub` : `MTurkCrowd`;

    // Replace with a modal or popover at somepoint in the future.
    // eslint-disable-next-line no-alert
    const result = window.prompt(`Are you sure you want to export this HIT to ${domain}.com?`);

    if (result) chrome.runtime.sendMessage({ hit, message: result, hitExporter: type }, markExport);
  }

  // Checks if the selected export is a direct export.
  function whichExport(type, id, hits) {
    switch (type) {
      case `turkerhub`:
      case `mturkcrowd`:
        directExport(type, id, hits);
        break;
      default:
        copyExport(type, id, hits);
    }
  }

  // Extracts the id and type from the event.
  function extractExport(event, hits) {
    const { id, type } = event.target.dataset;
    whichExport(type, id, hits);
  }

  const dom = (await new React(`HitSetTable`).dom) || (await new React(`TaskQueueTable`).dom);
  const props = (await new React(`HitSetTable`).props) || (await new React(`TaskQueueTable`).props);
  const exportType = await new Storage(`exports`).value
  const exportHITs = {};

  const projects = dom.getElementsByClassName(`table-row`);
  const { bodyData } = props;

  // Loops through all the HITs on the page and add the HIT Exporter button before their Title.
  for (let i = 0; i < projects.length; i += 1) {
    const hit = bodyData[i].project ? bodyData[i].project : bodyData[i];
    exportHITs[hit.hit_set_id] = hit;
    const project = projects[i].getElementsByClassName(`project-name-column`);

    const button = document.createElement(`button`);
    button.id = `hit-exporter-${hit.hit_set_id}`;
    button.type = `button`;
    button.className = `btn btn-primary btn-sm fa fa-share`;
    button.style.marginRight = `2px`;
    project[0].prepend(button);

    if (exportType === `all`) {
      button.addEventListener(`click`, event => {
        event.stopImmediatePropagation();
      });
      button.appendChild(popover(hit));
    } else {
      button.addEventListener(`click`, event => {
        event.stopImmediatePropagation();
        whichExport(exportType, hit.hit_set_id, exportHITs);
      });
    }
  }

  // Adds a listener for the buttons inside the HIT Exporter popup.
  if (exportType === `all`) {
    document.addEventListener(`click`, event => {
      if (event.target.matches(`.btn-hit-exporter`)) extractExport(event, exportHITs);
    });
  }
}

new Script(HIT_EXPORTER, `hitExporter`).run();
