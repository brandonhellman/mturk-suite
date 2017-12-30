(async () => {
    await ready({ enabled: `hitTracker` });

    const react = await require(`reactComponents/taskQueueTable/TaskQueueTable`);

    const hits = react.reactProps.bodyData.reduce((accumulator, currentValue) => {
        const hit = currentValue;
        const project = hit.project;
        const question = hit.question;
        const assignment_id = hit.assignment_id;

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
        })(project.assignment_duration_in_seconds - hit.time_to_deadline_in_seconds);

        accumulator[assignment_id] = {
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
            source: question && question.value ? question.value.replace(/amp;/g, ``) : null
        };

        chrome.runtime.sendMessage({
            function: `hitTrackerUpdate`,
            arguments: {
                hit: accumulator[assignment_id],
                assignment_id: assignment_id
            }
        });

        return accumulator;
    }, {});


    document.addEventListener(`submit`, (event) => {
        const returning = event.target.querySelector(`[value="delete"]`);

        if (returning) {
            const assignment_id = new URL(event.target.action).searchParams.get(`assignment_id`);

            if (assignment_id && hits[assignment_id]) {
                hits[assignment_id].state = `Returned`;

                chrome.runtime.sendMessage({
                    function: `hitTrackerUpdate`,
                    arguments: {
                        hit: hits[assignment_id],
                        assignment_id: assignment_id
                    }
                });
            }
        }
    });
})();