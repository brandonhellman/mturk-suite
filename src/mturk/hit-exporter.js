function hitExporterPopover(button, hit) {
  const { hit_set_id } = hit;
  const json = JSON.stringify(hit);

  const title = HTML`HIT Exporter <span style="font-size: 8px;">[${hit_set_id}]</span>`;
  const content = HTML`<div>
    <button class="btn btn-primary btn-sm" data-hit-json="${json}" data-type="short">Short</button>
    <button class="btn btn-primary btn-sm" data-hit-json="${json}" data-type="plain">Plain</button>
    <button class="btn btn-primary btn-sm" data-hit-json="${json}" data-type="markdown">Markdown</button>
    <button class="btn btn-primary btn-sm" data-hit-json="${json}" data-type="bbcode">BBCode</button>
    <button class="btn btn-primary btn-sm" data-hit-json="${json}" data-type="turkerhub">TurkerView Forum</button>
    <button class="btn btn-primary btn-sm" data-hit-json="${json}" data-type="mturkcrowd">MTurk Crowd</button>
    </div>`;

  const script = document.createElement(`script`);
  script.textContent = `$(document.currentScript).parent().popover({
    html: true,
    trigger: \`focus\`,
    contiainer: \`body\`,
    title: \`${title}\`,
    content: \`${content}\`
  });`;

  button.appendChild(script);
}

function hitExporterMarkButton(response) {
  const { id, success } = response;

  const button = document.querySelector(`[data-hit*="${id}"]`);
  button.classList.remove(`text-primary`);
  button.classList.remove(`text-success`);
  button.classList.remove(`text-danger`);
  button.classList.add(`text-${success ? `success` : `danger`}`);
}

function hitExporterPopoverButton(event, type, json) {
  const hit = json || JSON.parse(event.target.dataset.hitJson);
  const method = type || event.target.dataset.type;

  if (method === `turkerhub` || method === `mturkcrowd`) {
    // eslint-disable-next-line no-alert
    const result = window.prompt(
      `Are you sure you want to export this HIT to ${
        method === 'turkerhub' ? 'turkerview.forum' : method
      }.com?`,
    );

    if (result !== null) {
      chrome.runtime.sendMessage(
        { hit, hitExporter: method, message: result },
        hitExporterMarkButton,
      );
    }
  } else {
    chrome.runtime.sendMessage(
      { hit, hitExporter: method },
      hitExporterMarkButton,
    );
  }
}

async function hitExporter() {
  const [dom, props, options] = await Promise.all([
    ReactDOM(`HitSetTable`, `TaskQueueTable`),
    ReactProps(`HitSetTable`, `TaskQueueTable`),
    StorageGetKey(`options`),
    Enabled(`hitExporter`),
  ]);

  const { bodyData } = props;
  const { hitExporterType } = options;

  [...dom.querySelectorAll(`.table-row`)].forEach((row, i) => {
    const hit = JSON.stringify(bodyData[i].project || bodyData[i]);

    row
      .querySelector(`.project-name-column`)
      .insertAdjacentHTML(
        `afterbegin`,
        HTML`<span class="btn btn-sm fa fa-share text-primary" tabIndex="0" data-hit="${hit}"></span>`,
      );
  });

  [...dom.querySelectorAll(`[data-hit]`)].forEach((button) => {
    const hit = JSON.parse(button.dataset.hit);

    button.addEventListener(`click`, (event) => {
      event.stopImmediatePropagation();

      if (hitExporterType !== `all`)
        hitExporterPopoverButton(null, hitExporterType, hit);
    });

    if (hitExporterType === `all`) hitExporterPopover(button, hit);
  });

  document.addEventListener(`click`, (event) => {
    if (event.target.matches(`[data-hit-json]`)) {
      hitExporterPopoverButton(event);
    }
  });
}

hitExporter();
