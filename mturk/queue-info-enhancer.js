async function QUEUE_INFO_ENCHANCER() {
  const props = await new React(`TaskQueueTable`).props;
  const queueValue = props.bodyData.reduce(
    (acc, cV) => acc + cV.project.monetary_reward.amount_in_dollars,
    0
  );

  const header = document
    .getElementsByClassName(`task-queue-header`)[0]
    .getElementsByClassName(`m-b-0`)[0];
  header.textContent = `${header.textContent.trim().slice(0, -1)} - $${queueValue.toFixed(2)})`;
}

new Script(QUEUE_INFO_ENCHANCER, `rateLimitReloader`).run();
