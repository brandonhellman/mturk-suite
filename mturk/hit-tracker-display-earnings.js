async function hitTrackerDisplayEarnings() {
  const [earnings] = await Promise.all([
    StorageGetKey(`earnings`),
    Enabled(`hitTrackerDisplayEarnings`)
  ]);

  const money = `$${earnings.toFixed(2)}`;
  const { id } = chrome.runtime;
  const href = `chrome-extension://${id}/hit_tracker/hit_tracker.html`;

  const element = document.getElementsByClassName(`col-xs-7`)[0];
  element.insertAdjacentHTML(
    `beforeend`,
    `<span> - Earnings: </span><a href="${href}" target="_blank">${money}</a>`
  );
}

hitTrackerDisplayEarnings();
