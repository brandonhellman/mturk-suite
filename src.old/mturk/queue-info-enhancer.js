async function queueInfoEnhancer() {
  const [props] = await Promise.all([
    ReactProps(`TaskQueueTable`),
    Enabled(`queueInfoEnhancer`)
  ]);

  const value = props.bodyData.reduce(
    (acc, cV) => acc + cV.project.monetary_reward.amount_in_dollars,
    0
  );

  const header = document.querySelector(`h1.m-b-0`);
  header.textContent = `${header.textContent
    .trim()
    .slice(0, -1)} - $${value.toFixed(2)})`;
}

queueInfoEnhancer();
