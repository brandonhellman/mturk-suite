(async () => {
    await ready({ enabled: `requesterReviews` });

    const react = await require(
        `reactComponents/hitSetTable/HitSetTable`,
        `reactComponents/taskQueueTable/TaskQueueTable`,
        `reactComponents/hitStatusDetailsTable/HitStatusDetailsTable`);

    const objectReviews = await sendMessage({
        function: `requesterReviewsGet`,
        arguments: {
            requesters: [...new Set(react.reactProps.bodyData.map((currentValue) => currentValue.project ? currentValue.project.requester_id : currentValue.requester_id))]
        }
    });

    const hitRows = react.element.getElementsByClassName(`table-row`);

    for (let i = 0; i < hitRows.length; i++) {
        const hit = react.reactProps.bodyData[i].project ? react.reactProps.bodyData[i].project : react.reactProps.bodyData[i];

        const review = objectReviews[hit.requester_id];
        const tv = review.turkerview;
        const to = review.turkopticon;
        const to2 = review.turkopticon2;

        function column(array) {
            let templateLabels = ``;
            let templateValues = ``;

            for (const value of array) {
                templateLabels += `<div>${value[0]}</div>`;
                templateValues += `<div>${value[1]}</div>`;
            }

            return `<div class="col-xs-6">${templateLabels}</div><div class="col-xs-6">${templateValues}</div>`;
        }


        function requesterReviewGetClass(review) {
            const tv = storage.reviews.turkerview ? review.turkerview : null;
            const to = storage.reviews.turkopticon ? review.turkopticon : null;
            const to2 = storage.reviews.turkopticon2 ? review.turkopticon2 : null;

            const tvPay = tv ? (tv.ratings.hourly / 3) : null;
            const tvHourly = tv ? tv.ratings.pay : null;
            const toPay = to ? to.attrs.pay : null;
            const to2Hourly = to2 ? to2.recent.reward[1] > 0 ? ((to2.recent.reward[0] / to2.recent.reward[1] * 3600) / 3) : to2.all.reward[1] > 0 ? ((to2.all.reward[0] / to2.all.reward[1] * 3600) / 3) : null : null;

            if (tvPay || tvHourly || toPay || to2Hourly) {
                const average = [tvPay, tvHourly, toPay, to2Hourly].filter(Boolean).map((currentValue, index, array) => Number(currentValue) / array.length).reduce((a, b) => a + b);
                return (average > 3.75 ? `btn-success` : average > 2 ? `btn-warning` : average > 0 ? `btn-danger` : `btn-default`);
            }

            return `btn-default`;
        }


        const reviewClass = ((review) => {
            const tv = review.turkerview;
            const to = review.turkopticon;
            const to2 = review.turkopticon2;

            const tvPay = tv ? (tv.ratings.hourly / 3) : null;
            const tvHourly = tv ? tv.ratings.pay : null;
            const toPay = to ? to.attrs.pay : null;
            const to2Hourly = to2 ? to2.recent.reward[1] > 0 ? ((to2.recent.reward[0] / to2.recent.reward[1] * 3600) / 3) : to2.all.reward[1] > 0 ? ((to2.all.reward[0] / to2.all.reward[1] * 3600) / 3) : null : null;

            if (tvPay || tvHourly || toPay || to2Hourly) {
                const average = [tvPay, tvHourly, toPay, to2Hourly].filter(Boolean).map((currentValue, index, array) => Number(currentValue) / array.length).reduce((a, b) => a + b);
                return (average > 3.75 ? `btn-success` : average > 2 ? `btn-warning` : average > 0 ? `btn-danger` : `btn-default`);
            }

            return false;
        })(review);

        const turkerview = ((object) => {
            let template = ``;

            if (storage.reviews.turkerview === true) {
                if (object instanceof Object) {
                    const ratings = object.ratings;

                    template = column([
                        [`Hourly`, object.ratings.hourly],
                        [`Pay`, object.ratings.pay],
                        [`Fast`, object.ratings.fast],
                        [`Comm`, object.ratings.comm],
                        [`Rej`, object.rejections],
                        [`ToS`, object.tos],
                        [`Blocks`, object.blocks],
                    ]);
                } else {
                    template = `No Reviews`;
                }
                return `<div class="col-xs-4" style="width: 150px;"><h2><a class="text-primary" href="https://turkerview.com/requesters/${hit.requester_id}" target="_blank">TurkerView</a></h2>${template}<div><a href="https://turkerview.com/review.php?rname=${encodeURIComponent(hit.requester_name)}&rid=${hit.requester_id}&title=${hit.title}" target="_blank">Review on TV</a></div></div>`;
            }
            return ``;
        })(review.turkerview);

        const turkopticon = ((object) => {
            let template = ``;

            if (storage.reviews.turkopticon === true) {
                if (object instanceof Object) {
                    template = column([
                        [`Pay`, `${object.attrs.pay} / 5`],
                        [`Fast`, `${object.attrs.fast} / 5`],
                        [`Comm`, `${object.attrs.comm} / 5`],
                        [`Fair`, `${object.attrs.fair} / 5`],
                        [`Reviews`, object.reviews],
                        [`ToS`, object.tos_flags],
                    ]);
                } else {
                    template = `No Reviews`;
                }
                return `<div class="col-xs-4" style="width: 150px;"><h2><a class="text-primary" href="https://turkopticon.ucsd.edu/${hit.requester_id}" target="_blank">Turkopticon</a></h2>${template}<div class="col-xs-12">&nbsp;</div><div><a href="https://turkopticon.ucsd.edu/report?requester[amzn_id]=${hit.requester_id}&requester[amzn_name]=${encodeURIComponent(hit.requester_name)}" target="_blank">Review on TO</a></div></div>`;
            }
            return ``;
        })(review.turkopticon);

        const turkopticon2 = ((object) => {
            let template = ``;

            if (storage.reviews.turkopticon2 === true) {
                if (object instanceof Object) {
                    const all = object.all;
                    const recent = object.recent;
                    template = column([
                        [
                            `Hourly`,
                            recent.reward[1] > 0 ? `$${(recent.reward[0] / recent.reward[1] * 3600).toFixed(2)}` : `---`,
                            all.reward[1] > 0 ? `$${(all.reward[0] / all.reward[1] * 3600).toFixed(2)}` : `---`,
                        ],
                        [`Pending`, object.recent.pending > 0 ? `${(object.recent.pending / 86400).toFixed(2)} days` : `---`],
                        [`Response`, object.recent.comm[1] > 0 ? `${Math.round(object.recent.comm[0] / object.recent.comm[1] * 100)}% of ${object.recent.comm[1]}` : `---`],
                        [`Recommend`, object.recent.recommend[1] > 0 ? `${Math.round(object.recent.recommend[0] / object.recent.recommend[1] * 100)}% of ${to2.recent.recommend[1]}` : `---`],
                        [`Rejected`, object.recent.rejected[0]],
                        [`ToS`, object.recent.tos[0]],
                        [`Broken`, object.recent.broken[0]],
                    ]);
                } else {
                    template = `No Reviews`;
                }
                return `<div class="col-xs-4" style="width: 225px;"><h2><a class="text-primary" href="https://turkopticon.info/requesters/${hit.requester_id}" target="_blank">Turkopticon 2</a></h2>${template}<div><a href="https://turkopticon.info/reviews/new?name=${encodeURIComponent(hit.requester_name)}&rid=${hit.requester_id}" target="_blank">Review on TO2</a></div></div>`;
            }
            return ``;
        })(review.turkopticon2);

        for (const el of hitRows[i].getElementsByClassName(`expand-button`)) {
            const button = document.createElement(`button`);
            button.className = `btn btn-default btn-sm fa fa-user ${reviewClass ? reviewClass : ``}`;
            button.dataset.toggle = `popover`;
            button.style.marginRight = `5px`;
            button.addEventListener(`click`, (event) => {
                event.target.closest(`.desktop-row`).click();
            });

            const script = document.createElement(`script`);
            script.textContent = `$(document.currentScript).parent().popover({ html: true, trigger: 'hover focus', title: '${hit.requester_name} [${hit.requester_id}]', content: '<div class="container">${turkerview + turkopticon + turkopticon2}</div>' });`;
            button.appendChild(script);

            el.parentElement.insertBefore(button, el);
            el.style.display = `none`;
        }
    }

    const style = document.createElement(`style`);
    style.innerHTML = `.popover { max-width: 1000px; }`;
    document.head.appendChild(style);
})();