async function hitTrackerDisplayEarnings() {
  const [earnings] = await Promise.all([
    StorageGetKey(`earnings`),
    Enabled(`hitTrackerDisplayEarnings`)
  ]);

  const money = `$${earnings.toFixed(2)}`;
  const href = chrome.extension.getURL('/hit_tracker/hit_tracker.html');

  const element = document.getElementsByClassName(`col-xs-7`)[0];
  element.insertAdjacentHTML(
    `beforeend`,
    `<span> - Earnings: </span><a href="${href}" target="_blank" id="mts-ht-earnings">${money}</a>`
  );

  chrome.storage.onChanged.addListener(changes => {
    if (changes.earnings) {
      const el = document.getElementById(`mts-ht-earnings`);
      el.textContent = `$${changes.earnings.newValue.toFixed(2)}`;
    }
  });
}

hitTrackerDisplayEarnings();
