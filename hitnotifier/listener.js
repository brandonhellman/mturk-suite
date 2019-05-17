document.addEventListener(`hitCatcher`, (event) => {
  const hit = event.detail;

  chrome.runtime.sendMessage({
    hitCatcher: {
      id: hit.id,
      name: ``,
      once: hit.once,
      sound: hit.once,
      project: hit.project
    }
  });
});
