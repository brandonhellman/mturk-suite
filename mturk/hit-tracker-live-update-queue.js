async function hitTrackerLiveUpdateQueue() {
  const [reactProps] = await Promise.all([
    ReactProps(`TaskQueueTable`),
    Enabled(`hitTrackerLiveUpdate`)
  ]);

  const hits = reactProps.bodyData.reduce((accumulator, currentValue) => {
    const hit = currentValue;
    const { project, question } = hit;
    const assignmentId = hit.assignment_id;
    const mturkDate = MturkDate(
      (project.assignment_duration_in_seconds -
        hit.time_to_deadline_in_seconds) *
        1000
    );
    accumulator[assignmentId] = {
      hit_id: hit.task_id,
      requester_id: project.requester_id,
      requester_name: project.requester_name,
      reward: {
        amount_in_dollars: project.monetary_reward.amount_in_dollars,
        currency_code: project.monetary_reward.currency_code
      },
      state: hit.state,
      title: project.title,

      date: mturkDate,
      source:
        question && question.value ? question.value.replace(/amp;/g, ``) : null
    };

    chrome.runtime.sendMessage({
      function: `hitTrackerUpdate`,
      arguments: {
        hit: accumulator[assignmentId],
        assignment_id: assignmentId
      }
    });

    return accumulator;
  }, {});

  document.addEventListener(`submit`, event => {
    const returning = event.target.querySelector(`[value="delete"]`);

    if (returning) {
      const assignmentId = new URL(event.target.action).searchParams.get(
        `assignment_id`
      );

      if (assignmentId && hits[assignmentId]) {
        hits[assignmentId].state = `Returned`;

        chrome.runtime.sendMessage({
          function: `hitTrackerUpdate`,
          arguments: {
            hit: hits[assignmentId],
            assignment_id: assignmentId
          }
        });
      }
    }
  });
}

hitTrackerLiveUpdateQueue();
