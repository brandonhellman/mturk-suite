async function hitCatcherButtons() {
  const opened = await new Promise(resolve =>
    chrome.runtime.sendMessage({ hitCatcher: `open` }, resolve)
  );

  if (opened) {
    const dom = await ReactDOM(`HitSetTable`);
    const reactProps = await ReactProps(`HitSetTable`);

    const hits = reactProps.bodyData.reduce((accumulator, currentValue) => {
      accumulator[currentValue.hit_set_id] = currentValue;
      return accumulator;
    }, {});

    [...dom.querySelectorAll(`.work-btn.hidden-sm-down`)].forEach(element => {
      const hitSetId = element.href.match(/projects\/([A-Z0-9]+)\/tasks/)[1];

      const group = document.createElement(`div`);
      group.className = `btn-group`;

      const accept = document.createElement(`a`);
      accept.href = element.href;
      accept.className = `btn work-btn`;
      accept.textContent = `Accept`;
      group.appendChild(accept);

      const dropdown = document.createElement(`button`);
      dropdown.className = `btn btn-primary dropdown-toggle`;
      dropdown.dataset.toggle = `dropdown`;
      dropdown.addEventListener(`click`, event => {
        event.target.closest(`.desktop-row`).click();
      });
      group.appendChild(dropdown);

      const dropdownMenu = document.createElement(`ul`);
      dropdownMenu.className = `dropdown-menu dropdown-menu-right`;
      group.appendChild(dropdownMenu);

      const once = document.createElement(`div`);
      once.className = `col-xs-6`;
      dropdownMenu.appendChild(once);

      const onceAction = document.createElement(`button`);
      onceAction.className = `btn btn-primary`;
      onceAction.style.width = `100%`;
      onceAction.textContent = `Once`;
      onceAction.addEventListener(`click`, event => {
        event.target.closest(`.desktop-row`).click();

        chrome.runtime.sendMessage({
          hitCatcher: {
            id: hitSetId,
            name: ``,
            once: true,
            sound: true,
            project: hits[hitSetId]
          }
        });
      });
      once.appendChild(onceAction);

      const panda = document.createElement(`div`);
      panda.className = `col-xs-6`;
      dropdownMenu.appendChild(panda);

      const pandaAction = document.createElement(`button`);
      pandaAction.className = `btn btn-primary`;
      pandaAction.style.width = `100%`;
      pandaAction.textContent = `Panda`;
      pandaAction.addEventListener(`click`, event => {
        event.target.closest(`.desktop-row`).click();

        chrome.runtime.sendMessage({
          hitCatcher: {
            id: hitSetId,
            name: ``,
            once: false,
            sound: false,
            project: hits[hitSetId]
          }
        });
      });
      panda.appendChild(pandaAction);

      element.replaceWith(group);
    });
  }
}

hitCatcherButtons();
