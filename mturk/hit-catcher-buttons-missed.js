chrome.runtime.onMessage.addListener(async (request) => {
  const hitSetId = request.hitMissed;

  if (hitSetId) {
    const once = document.createElement(`button`);
    once.className = `btn btn-primary`;
    once.textContent = `Once`;
    once.style.marginLeft = `5px`;
    once.addEventListener(`click`, () => {
      chrome.runtime.sendMessage({
        hitCatcher: {
          id: hitSetId,
          name: ``,
          once: true,
          sound: true
        }
      });
    });

    const panda = document.createElement(`button`);
    panda.className = `btn btn-primary`;
    panda.textContent = `Panda`;
    panda.style.marginLeft = `5px`;
    panda.addEventListener(`click`, () => {
      chrome.runtime.sendMessage({
        hitCatcher: {
          id: hitSetId,
          name: ``,
          once: false,
          sound: false
        }
      });
    });

    const rEl = await ReactEl(`reactComponents/alert/Alert`);
    rEl.getElementsByTagName(`h3`)[0].appendChild(once);
    rEl.getElementsByTagName(`h3`)[0].appendChild(panda);
  }
});
