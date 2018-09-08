/* eslint-disable camelcase */
function matches(hit, list) {
  const values = [
    hit.hit_set_id,
    hit.requester_id,
    hit.requester_name,
    hit.title
  ];

  return Object.keys(list).some(key => {
    const { match, strict } = list[key];

    return strict
      ? values.some(value => value === match)
      : values.some(value => value.toLowerCase().includes(match.toLowerCase()));
  });
}

async function fillAddModal(event) {
  const { name, match, strict } = event.srcElement.dataset;
  document.getElementById(`block-list-add-name`).value = name;
  document.getElementById(`block-list-add-match`).value = match;
  document.getElementById(`block-list-add-strict`).checked = strict === `true`;
}

async function fillEditModal(event) {
  const blockList = await StorageGetKey(`blockList`);
  const item = blockList[event.target.dataset.key];

  document.getElementById(`block-list-edit-name`).value = item.name;
  document.getElementById(`block-list-edit-match`).value = item.match;
  document.getElementById(`block-list-edit-strict`).checked = item.strict;
}

async function drawItems(list) {
  const blockList = list || (await StorageGetKey(`blockList`));

  const sorted = Object.keys(blockList)
    .map(key => blockList[key])
    .sort((a, b) => a.name.localeCompare(b.name, `en`, { numeric: true }));

  const body = document.querySelector(`#block-list-modal .modal-body`);

  while (body.firstChild) body.removeChild(body.firstChild);

  sorted.forEach(item => {
    const { name, match } = item;

    body.insertAdjacentHTML(
      `afterbegin`,
      HTML`<button type="button" class="btn btn-danger bl-btn-edit" style="margin: 4px 0px 4px 4px" data-toggle="modal" data-target="#block-list-edit-modal" data-key="${match}">${name}</button>`
    );
  });

  [...document.querySelectorAll(`.bl-btn-edit`)].forEach(el => {
    el.addEventListener(`click`, fillEditModal);
  });
}

async function updateBlockList(blockList) {
  chrome.storage.local.set({ blockList });
  drawItems(blockList);
}

(async function blockListOnMturk() {
  const [blockList, element, props] = await Promise.all([
    StorageGetKey(`blockList`),
    ReactDOM(`HitSetTable`),
    ReactProps(`HitSetTable`),
    Enabled(`blockListOnMturk`)
  ]);

  const blockLocation = await new Promise(async r => {
    try {
      await Enabled(`blockLocation`);
      r(true);
    } catch (err) {
      r(false);
    }
  });

  const data = props.bodyData;

  if (blockLocation) {
    // from all Hits with requirements, get the ones with location requirement not met
    const with_location_requitement_not_meet = data
      .filter(d => d.project_requirements.length > 0)
      .filter(d =>
        d.project_requirements.some(
          r =>
            r.qualification_type_id == "00000000000000000071" &&
            !r.caller_meets_requirements
        )
      );

    const extra_blockList = with_location_requitement_not_meet.reduce(
      (result, h) => {
        result[h.hit_set_id] = {
          match: h.hit_set_id,
          name: h.title,
          strict: true
        };
        return result;
      },
      {}
    );

    for (const attrname in extra_blockList) {
      blockList[attrname] = extra_blockList[attrname];
    }
  }

  const blocked = data.reduce((arr, hit, index) => {
    if (matches(hit, blockList)) arr.push(index);
    return arr;
  }, []);

  const rows = element.getElementsByClassName(`hit-set-table-row`);

  [...rows].forEach((row, i) => {
    const hit = row;

    if (blocked.includes(i)) {
      hit.style.display = `none`;
      hit.classList.add(`bg-danger`);
    }

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.matches(`.expanded-row`)) {
            const { hit_set_id, requester_id, requester_name, title } = data[i];

            node.insertAdjacentHTML(
              `beforeEnd`,
              HTML`<div>
                <button type="button" class="btn btn-danger btn-sm m-r-xs" data-toggle="modal" data-target="#block-list-add-modal" data-name="${requester_name}" data-match="${requester_id}" data-strict="true">Block Requester</button>
                <button type="button" class="btn btn-danger btn-sm m-r-xs" data-toggle="modal" data-target="#block-list-add-modal" data-name="${title}"          data-match="${title}"        data-strict="true">Block Title</button>
                <button type="button" class="btn btn-danger btn-sm m-r-xs" data-toggle="modal" data-target="#block-list-add-modal" data-name="${title}"          data-match="${hit_set_id}"   data-strict="true">Block HIT</button>
              </div>`
            );

            node
              .querySelectorAll(`[data-target="#block-list-add-modal"]`)
              .forEach(el => {
                el.addEventListener(`click`, fillAddModal);
              });
          }
        });
      });
    });

    observer.observe(hit, { childList: true });
  });

  const filter = document.querySelector(`[data-target="#filter"]`);

  filter.insertAdjacentHTML(
    `afterend`,
    HTML`<button type="button" class="btn btn-primary m-l-xs" data-toggle="modal" data-target="#block-list-modal">Block List</button>`
  );

  const holder = document.getElementsByClassName(
    `expand-collapse-projects-holder`
  )[0];

  holder.insertAdjacentHTML(
    `afterbegin`,
    HTML`<span class="expand-projects-button">
      <a href="#" class="table-expand-collapse-button">
        <i class="fa fa-plus-circle" id="block-list-toggle-icon"></i>
        <span class="button-text" id="block-list-toggle">Show Blocked (${
          blocked.length
        })</span>
      </a>
    </span>`
  );

  const openBlockList = document.querySelector(
    `[data-target="#block-list-modal"]`
  );
  const blockListToggle = document.getElementById(`block-list-toggle`);

  openBlockList.addEventListener(`click`, () => drawItems());

  blockListToggle.parentElement.addEventListener(`click`, () => {
    blocked.forEach(index => {
      const hit = rows[index];
      hit.style.display = hit.style.display === `none` ? `` : `none`;
    });

    const icon = document.getElementById(`block-list-toggle-icon`);
    icon.classList.toggle(`fa-plus-circle`);
    icon.classList.toggle(`fa-minus-circle`);

    const state = blockListToggle.textContent.includes(`Show`)
      ? `Hide`
      : `Show`;
    blockListToggle.textContent = `${state} Blocked (${blocked.length})`;
  });

  document.body.insertAdjacentHTML(
    `beforeend`,
    HTML`<div class="modal fade in" id="block-list-modal" style="margin-top: 60px;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Block List</h2>
            <button type="button" class="close" data-dismiss="modal" style="margin-right: 0;">&times;</button>
          </div>
          <div class="modal-body" id="block-list">
          </div>
          <div class="modal-footer" style="display: block; padding: 15px;">
            <button type="button" class="btn btn-danger">Delete All</button>
            <label class="btn btn-secondary mb-0">
              Import
              <input type="file" id="block-list-import" style="display: none;"></input>
            </label>
            <button type="button" class="btn btn-secondary">Export</button>
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#block-list-add-modal" data-name="" data-match="" data-strict="true">Add</button>
          </div>
        </div>
      </div>
    </div>`
  );

  const blockListModal = document.getElementById(`block-list-modal`);

  const blockListDeleteAll = blockListModal.querySelector(
    `.modal-footer > .btn.btn-danger`
  );
  const blockListAddItem = blockListModal.querySelector(
    `[data-target="#block-list-add-modal"]`
  );

  blockListDeleteAll.addEventListener(`click`, () => {
    // eslint-disable-next-line no-alert
    const result = window.confirm(
      `Are you sure you delete your entire Block List?`
    );

    if (result) updateBlockList({});
  });

  blockListAddItem.addEventListener(`click`, fillAddModal);

  document.body.insertAdjacentHTML(
    `beforeend`,
    HTML`<div class="modal" id="block-list-add-modal" style="margin-top: 60px;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Add To Block List</h2>
            <button type="button" class="close text-danger" data-dismiss="modal" style="margin-right: 0;">&times;</button>
          </div>
          <div class="modal-body text-dark">
            <div style="margin-bottom: 12px;">
              <h3 title="Nickname for the match term." style="cursor: help;">Name</h3>
              <input type="text" id="block-list-add-name" class="form-control">
            </div>
            <div style="margin-bottom: 12px;">
              <h3 title="Matches a requester id or name, group id or hit title." style="cursor: help;">Match</h3>
              <input type="text" id="block-list-add-match" class="form-control">
            </div>
            <div style="text-align: center;">
              <label title="Require 100% match. (recommended)" style="cursor: help; margin: auto;">
                <input type="checkbox" id="block-list-add-strict">
                Strict Matching
              </label>
            </div>
          </div>
          <div class="modal-footer" style="display: block; padding: 15px;">
            <button type="button" class="btn btn-primary" data-dismiss="modal">Save</button>
          </div>
        </div>
      </div>
    </div>`
  );

  const addModal = document.getElementById(`block-list-add-modal`);
  const addModalSave = addModal.querySelector(
    `.modal-footer > .btn.btn-primary`
  );

  addModalSave.addEventListener(`click`, async () => {
    const name = document.getElementById(`block-list-add-name`).value;
    const match = document.getElementById(`block-list-add-match`).value;
    const strict = document.getElementById(`block-list-add-strict`).checked;

    if (name.length && match.length) {
      const bl = await StorageGetKey(`blockList`);
      bl[match] = { name, match, strict };
      updateBlockList(bl);
    }
  });

  document.body.insertAdjacentHTML(
    `beforeend`,
    HTML`<div class="modal" id="block-list-edit-modal" style="margin-top: 60px;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Edit Block List Item</h2>
            <button type="button" class="close text-danger" data-dismiss="modal" style="margin-right: 0;">&times;</button>
          </div>
          <div class="modal-body text-dark">
            <div style="margin-bottom: 12px;">
              <h3 title="Matches a requester id or name, group id or hit title." style="cursor: help;">Match</h3>
              <input type="text" id="block-list-edit-name" class="form-control">
            </div>
            <div style="margin-bottom: 12px;">
              <h3 title="Matches a requester id or name, group id or hit title." style="cursor: help;">Match</h3>
              <input type="text" id="block-list-edit-match" class="form-control" disabled>
            </div>
            <div style="text-align: center;">
              <label title="Require 100% match. (recommended)" style="cursor: help; margin: auto;">
                <input type="checkbox" id="block-list-edit-strict">
                Strict Matching
              </label>
            </div>
          </div>
          <div class="modal-footer" style="display: block; padding: 15px;">
            <button type="button" class="btn btn-danger" data-dismiss="modal">Delete</button>
            <button type="button" class="btn btn-primary" data-dismiss="modal">Save</button>
          </div>
        </div>
      </div>
    </div>`
  );

  const editModal = document.getElementById(`block-list-edit-modal`);
  const editModalDelete = editModal.querySelector(
    `.modal-footer > .btn.btn-danger`
  );
  const editModalSave = editModal.querySelector(
    `.modal-footer > .btn.btn-primary`
  );

  editModalDelete.addEventListener(`click`, async () => {
    const match = document.getElementById(`block-list-edit-match`).value;

    if (match.length) {
      const bl = await StorageGetKey(`blockList`);
      delete bl[match];
      updateBlockList(bl);
    }
  });

  editModalSave.addEventListener(`click`, async () => {
    const name = document.getElementById(`block-list-edit-name`).value;
    const match = document.getElementById(`block-list-edit-match`).value;
    const strict = document.getElementById(`block-list-edit-strict`).checked;

    if (name.length && match.length) {
      const bl = await StorageGetKey(`blockList`);
      bl[match] = { name, match, strict };
      updateBlockList(bl);
    }
  });

  const nestedModals = document.createElement(`script`);
  nestedModals.src = chrome.extension.getURL(`bootstrap/js/nested-modals.js`);
  document.head.appendChild(nestedModals);
})();
