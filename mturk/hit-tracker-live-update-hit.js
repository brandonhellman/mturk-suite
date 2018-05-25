async function hitTrackerLiveUpdateHIT() {
  const [modal, submitter, timer] = await Promise.all([
    ReactProps(`ShowModal`),
    ReactProps(`TaskSubmitter`),
    ReactProps(`CompletionTimer`),
    Enabled(`hitTrackerLiveUpdate`)
  ]);

  const assignmentId = new URLSearchParams(window.location.search).get(
    `assignment_id`
  );

  if (assignmentId) {
    const { modalOptions } = modal;
    const offset =
      (timer.originalTimeToCompleteInSeconds - timer.timeRemainingInSeconds) *
      1000;
    const mturkDate = MturkDate(offset);

    const message = {
      function: `hitTrackerUpdate`,
      arguments: {
        hit: {
          hit_id: submitter.hiddenFormParams.task_id,
          requester_id: new URLSearchParams(
            modalOptions.contactRequesterUrl
          ).get(`hit_type_message[requester_id]`),
          requester_name: modalOptions.requesterName,
          reward: {
            amount_in_dollars: modalOptions.monetaryReward.amountInDollars,
            currency_code: modalOptions.monetaryReward.currencyCode
          },
          state: `Assigned`,
          title: modalOptions.projectTitle,

          date: mturkDate
        },
        assignment_id: assignmentId
      }
    };

    const source = document.querySelector(`iframe.embed-responsive-item`);

    if (source) {
      message.arguments.hit.source = source.src;
    }

    chrome.runtime.sendMessage(message);

    document.addEventListener(`submit`, event => {
      const returning = event.target.querySelector(`[value="delete"]`);

      if (returning) {
        message.arguments.hit.state = `Returned`;

        chrome.runtime.sendMessage(message);
      }
    });

    window.addEventListener(`message`, event => {
      try {
        const data = JSON.parse(event.data);

        if (data.answer !== undefined && data.assignmentId !== undefined) {
          chrome.runtime.sendMessage({
            function: `hitTrackerSubmitted`,
            arguments: { data }
          });
        }
      } catch (error) {
        /* empty catch */
      }
    });
  }
}

hitTrackerLiveUpdateHIT();
