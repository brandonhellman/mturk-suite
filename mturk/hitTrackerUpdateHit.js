(async () => {
    await ready({ enabled: `hitTracker`, document: `interactive`, matches: [`/projects/*/tasks/*`] });

    const react = await require(`reactComponents/common/ShowModal`);
    const hitId = await require(`reactComponents/workPipeline/TaskSubmitter`);
    const timer = await require(`reactComponents/common/CountdownTimer`);

    const assignment_id = new URLSearchParams(window.location.search).get(`assignment_id`);

    if (typeof assignment_id === `string`) {
        const parameters2 = new URLSearchParams(react.reactProps.modalOptions.contactRequesterUrl);

        const mturkDate = ((number) => {    
            function dst () {
                const today = new Date();
                const year = today.getFullYear();
                let start = new Date(`March 14, ${year} 02:00:00`);
                let end = new Date(`November 07, ${year} 02:00:00`);
                let day = start.getDay();
                start.setDate(14 - day);
                day = end.getDay();
                end.setDate(7 - day);
                return (today >= start && today < end) ? true : false;
            }

            const accepted = new Date(Date.now() - (number * 1000));
            const utc = accepted.getTime() + (accepted.getTimezoneOffset() * 60000);
            const offset = dst() === true ? `-7` : `-8`;
            const amz = new Date(utc + (3600000 * offset));
            const day = (amz.getDate()) < 10 ? `0` + (amz.getDate()).toString() : (amz.getDate()).toString();
            const month = (amz.getMonth() + 1) < 10 ? `0` + (amz.getMonth() + 1).toString() : (amz.getMonth() + 1).toString();
            const year = (amz.getFullYear()).toString();
            const date = year + month + day;

            return date;
        })(timer.reactProps.originalTimeToCompleteInSeconds - timer.reactProps.timeRemainingInSeconds);

        const message = {
            function: `hitTrackerUpdate`,
            arguments: {
                hit: {
                    hit_id: hitId.reactProps.hiddenFormParams.task_id,
                    requester_id: new URLSearchParams(react.reactProps.modalOptions.contactRequesterUrl).get(`hit_type_message[requester_id]`),
                    requester_name: react.reactProps.modalOptions.requesterName,
                    reward: {
                        amount_in_dollars: react.reactProps.modalOptions.monetaryReward.amountInDollars,
                        currency_code: react.reactProps.modalOptions.monetaryReward.currencyCode
                    },
                    state: `Assigned`,
                    title: react.reactProps.modalOptions.projectTitle,

                    date: mturkDate,
                    source: document.querySelector(`iframe.embed-responsive-item`).src
                },
                assignment_id: assignment_id
            }
        };

        chrome.runtime.sendMessage(message);

        document.addEventListener(`submit`, (event) => {
            const returning = event.target.querySelector(`[value="delete"]`);

            if (returning) {
                message.arguments.hit.state = `Returned`;

                chrome.runtime.sendMessage(message);
            }
        });

        window.addEventListener(`message`, (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.answer !== undefined && data.assignmentId !== undefined) {
                    chrome.runtime.sendMessage({
                        function: `hitTrackerSubmitted`,
                        arguments: {
                            data: data
                        }
                    });
                }
            } catch (error) {}
        });
    }
})();