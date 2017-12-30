(async () => {
    await ready({ enabled: `queueInfoEnhancer` });

    const react = await require(`reactComponents/taskQueueTable/TaskQueueTable`);

    const bodyData = react.reactProps.bodyData;

    const count = bodyData.length;
    const total = bodyData.map(hit => hit.project.monetary_reward.amount_in_dollars).reduce((a, b) => a + b, 0);

    const info = document.createElement(`span`);
    info.className = `h2 text-muted result-count-info`;
    info.textContent = `(${count} HIT${count.length === 1 ? `` : `s`} worth $${total.toFixed(2)})`;

    document.getElementsByClassName(`task-queue-header`)[0].getElementsByClassName(`m-b-0`)[0].appendChild(info);
})();