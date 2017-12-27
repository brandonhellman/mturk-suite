//********** Context Menus **********//
chrome.contextMenus.create({
    title: `Paste Mturk Worker ID`,
    contexts: [`editable`],
    onclick(info, tab) {
        chrome.tabs.executeScript(tab.id, {
            code: `elem = document.activeElement; elem.value += '${storage.workerID}'; elem.dispatchEvent(new Event('change', { bubbles: true }));`,
            frameId: info.frameId,
        });
    }
});

chrome.contextMenus.create({
    title: `Contact Requester`,
    contexts: [`link`],
    targetUrlPatterns: [`https://worker.mturk.com/requesters/*`],
    onclick(info, tab) {
        const match = info.linkUrl.match(/([A-Z0-9]+)/);
        const requesterId = match ? match[1] : null;

        if (requesterId) {
            window.open(`https://worker.mturk.com/contact_requester/hit_type_messages/new?hit_type_message[hit_type_id]=YOURMTURKHIT&hit_type_message[requester_id]=${requesterId}`);
        }
    }
});

chrome.contextMenus.create({
    title: `HIT Catcher - Once`,
    contexts: [`link`],
    targetUrlPatterns: [`https://worker.mturk.com/projects/*/tasks*`],
    onclick (info, tab) {
        const match = info.linkUrl.match(/projects\/([A-Z0-9]+)\/tasks/);
        const hitSetId = match ? match[1] : null;

        if (hitSetId) {
            chrome.runtime.sendMessage({
                hitCatcher: {
                    id: hitSetId, 
                    name: ``,
                    once: true,
                    sound: true
                }
            });
        }
    }
});

chrome.contextMenus.create({
    title: `HIT Catcher - Panda`,
    contexts: [`link`],
    targetUrlPatterns: [`https://worker.mturk.com/projects/*/tasks*`],
    onclick (info, tab) {
        const match = info.linkUrl.match(/projects\/([A-Z0-9]+)\/tasks/);
        const hitSetId = match ? match[1] : null;

        if (hitSetId){
            chrome.runtime.sendMessage({
                hitCatcher: {
                    id: hitSetId, 
                    name: ``,
                    once: false,
                    sound: false
                }
            });
        }
    }
});

//********** Omnibox **********//
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    chrome.omnibox.setDefaultSuggestion({
        description: 'Search Mechanical Turk for %s'
    });
});

chrome.omnibox.onInputEntered.addListener((text) => {
    chrome.tabs.getSelected(null, (tab) => {
        chrome.tabs.update(tab.id, {
            url: `https://worker.mturk.com/?filters%5Bsearch_term%5D=${encodeURIComponent(text)}`
        });
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const func = request.function;

    if (func && window[func] instanceof Function) {
        window[func](request.arguments, request, sender, sendResponse);
        return true;
    }
});

//********** Web Requests **********//
let requestsDB = {}, doNotRedirect = false;

chrome.webRequest.onBeforeRequest.addListener((details) => {
    const match = details.url.match(/https:\/\/worker.mturk.com\/projects\/([A-Z0-9]+)\/tasks\/accept_random/);

    if (match) {
        requestsDB[details.requestId] = {
            tabId: details.tabId,
            hit_set_id: match[1]
        };
    }
}, {
    urls: [`https://worker.mturk.com/projects/*/tasks/accept_random*`], types: [`main_frame`]
}, [`requestBody`]);

chrome.webRequest.onCompleted.addListener((details) => {
    const request = requestsDB[details.requestId];

    if (request) {
        const catcher = chrome.extension.getViews().map((o) => o.location.pathname).includes(`/hit_catcher/hit_catcher.html`);

        if (catcher && details.url.indexOf(`https://worker.mturk.com/projects/${request.hit_set_id}/tasks`) === -1) {
            setTimeout(() => {
                chrome.tabs.sendMessage(request.tabId, {
                    hitMissed: request.hit_set_id
                });
            }, 250);
        }
    }
}, {
    urls: [`https://worker.mturk.com/*`], types: [`main_frame`]
}, [`responseHeaders`]);

chrome.webRequest.onBeforeRequest.addListener((details) => {
    if (doNotRedirect === true) {
        let url = details.url;

        if (url.indexOf(`doNotRedirect=true`) === -1) {
            const hash = (url.indexOf(`#`) === -1) ? url.length : url.indexOf('#');
            const symbol = (url.indexOf(`?`) === -1) ? `?` : `&`;
            const redirectUrl = url.substring(0, hash) + symbol + `doNotRedirect=true` + url.substring(hash);
            return { redirectUrl: redirectUrl };
        }
    }
}, {
    urls: [`https://www.mturk.com/*`]
}, [`blocking`]);


async function hitExportShort(arguments, request, sender, sendResponse) {
    new Notification(`HIT Export Failed!`, {
        icon: `/media/icon_128.png`,
        body: `Short export support is coming soon.`,
    });
}

async function hitExportPlain(arguments, request, sender, sendResponse) {
    const hit = arguments.hit;
    const review = await requesterReviewsGetExport(hit.requester_id);
    const reviewsTemplate = [];

    if (storage.scripts.requesterReviews === true) {
        if (storage.reviews.turkerview === true) {
            const tv = review.turkerview;

            if (tv instanceof Object) {
                const tvRatings = tv.ratings;

                reviewsTemplate.push([
                    `TV:`,
                    `[Hrly: $${tvRatings.hourly}]`,
                    `[Pay: ${tvRatings.pay}]`,
                    `[Fast: ${tvRatings.fast}]`,
                    `[Comm: ${tvRatings.comm}]`,
                    `[Rej: ${tv.rejections}]`,
                    `[ToS: ${tv.tos}]`,
                    `[Blk: ${tv.blocks}]`,
                    `• https://turkerview.com/requesters/${hit.requester_id}`
                ].join(` `));
            } else {
                reviewsTemplate.push(`TV: No Reviews • https://turkerview.com/requesters/${hit.requester_id}`);
            }
        }

        if (storage.reviews.turkopticon === true) {
            const to = review.turkopticon;

            if (to instanceof Object) {
                const toAttrs = to.attrs;

                reviewsTemplate.push([
                    `TO:`,
                    `[Pay: ${toAttrs.pay}]`,
                    `[Fast: ${toAttrs.fast}]`,
                    `[Comm: ${toAttrs.comm}]`,
                    `[Fair: ${toAttrs.fair}]`,
                    `[Reviews: ${to.reviews}]`,
                    `[ToS: ${to.tos_flags}]`,
                    `• https://turkopticon.ucsd.edu/${hit.requester_id}`,
                ].join(` `));
            } else {
                reviewsTemplate.push(`TO: No Reviews • https://turkopticon.ucsd.edu/${hit.requester_id}`);
            }
        }

        if (storage.reviews.turkopticon2 === true) {
            const to2 = review.turkopticon2;

            if (to2 instanceof Object) {
                const to2Recent = to2.recent;

                reviewsTemplate.push([
                    `TO2:`,
                    `[Hrly: ${to2Recent.reward[1] > 0 ? `${(to2Recent.reward[0] / to2Recent.reward[1] * 3600).toMoneyString()}` : `---`}]`,
                    `[Pen: ${to2Recent.pending > 0 ? `${(to2Recent.pending / 86400).toFixed(2)} days` : `---`}]`,
                    `[Res: ${to2Recent.comm[1] > 0 ? `${Math.round(to2Recent.comm[0] / to2Recent.comm[1] * 100)}% of ${to2Recent.comm[1]}` : `---`}]`,
                    `[Rec: ${to2Recent.recommend[1] > 0 ? `${Math.round(to2Recent.recommend[0] / to2Recent.recommend[1] * 100)}% of ${to2Recent.recommend[1]}` : `---`}]`,
                    `[Rej: ${to2Recent.rejected[0]}]`,
                    `[ToS: ${to2Recent.tos[0]}]`,
                    `[Brk: ${to2Recent.broken[0]}]`,
                    `https://turkopticon.info/requesters/${hit.requester_id}`,
                ].join(` `));
            } else {
                reviewsTemplate.push(`TO2: No Reviews • https://turkopticon.info/requesters/${hit.requester_id}`);
            }
        }
    }

    const exportTemplate = [
        `Title: ${hit.title} • https://worker.mturk.com/projects/${hit.hit_set_id}/tasks • https://worker.mturk.com/projects/${hit.hit_set_id}/tasks/accept_random`,
        `Requester: ${hit.requester_name} • https://worker.mturk.com/requesters${hit.requester_id}/projects`,
        reviewsTemplate.join(`\n`),
        `Reward: ${hit.monetary_reward.amount_in_dollars.toMoneyString()}`,
        `Duration: ${hit.assignment_duration_in_seconds.toTimeString()}`,
        `Available: ${hit.assignable_hits_count}`,
        `Description: ${hit.description}`,
        `Requirements: ${hit.project_requirements.map(o => `${o.qualification_type.name} ${o.comparator} ${o.qualification_values.map(v => v).join(`, `)}`.trim()).join(`; `) || `None`}`,
        ``
    ].filter((item) => item !== undefined && item !== ``).join(`\n`);

    copyTextToClipboard(exportTemplate);

    const notification = new Notification(`HIT Export Succesful!`, {
        icon: `/media/icon_128.png`,
        body: `Plain export has been copied to your clipboard.`,
    });

    setTimeout(notification.close.bind(notification), 10000);
}

async function hitExportBBCode(arguments, request, sender, sendResponse) {
    const hit = arguments.hit;
    const review = await requesterReviewsGetExport(hit.requester_id);
    const reviewsTemplate = [];

    function ratingColor(rating) {
        return rating;

        if (rating > 3.99) {
            return `[color=#00cc00]${rating}[/color]`;
        }
        else if (rating > 2.99) {
            return `[color=#cccc00]${rating}[/color]`;
        }
        else if (rating > 1.99) {
            return `[color=#cc6600]${rating}[/color]`;
        }
        else if (rating > 0.00) {
            return `[color=#cc0000]${rating}[/color]`;
        }
        return rating;
    }

    function percentColor(rating) {
        if (rating[1] > 0) {
            const percent = Math.round(rating[0] / rating[1] * 100);

            return `${percent}% of ${rating[1]}`;

            if (percent > 79) {
                return `[color=#00cc00]${percent}%[/color] of ${rating[1]}`;
            }
            else if (percent > 59) {
                return `[color=#cccc00]${percent}%[/color] of ${rating[1]}`;
            }
            else if (percent > 39) {
                return `[color=#cc6600]${percent}%[/color] of ${rating[1]}`;
            }
            return `[color=#cc0000]${percent}%[/color] of ${rating[1]}`;
        }
        return `---`;
    }

    function goodBadColor(rating) {
        return rating;
        return `[color=${rating === 0 ? `#00cc00` : `#cc0000`}]${rating}[/color]`;
    }

    if (storage.scripts.requesterReviews === true) {
        if (storage.reviews.turkerview === true) {
            const tv = review.turkerview;

            if (tv instanceof Object) {
                const tvRatings = tv.ratings;

                reviewsTemplate.push([
                    `[b][url=https://turkerview.com/requesters/${hit.requester_id}]TV[/url]:`,
                    `[Hrly: $${tv.ratings.hourly}]`,
                    `[Pay: ${ratingColor(tv.ratings.pay)}]`,
                    `[Fast: ${ratingColor(tv.ratings.fast)}]`,
                    `[Comm: ${ratingColor(tv.ratings.comm)}]`,
                    `[Rej: ${goodBadColor(tv.rejections)}]`,
                    `[ToS: ${goodBadColor(tv.tos)}]`,
                    `[Blk: ${goodBadColor(tv.blocks)}][/b]`
                ].join(` `));
            } else {
                reviewsTemplate.push(`[b][url=https://turkerview.com/requesters/${hit.requester_id}]TV[/url]:[/b] No Reviews`);
            }
        }

        if (storage.reviews.turkopticon === true) {
            const to = review.turkopticon;

            if (to instanceof Object) {
                const toAttrs = to.attrs;

                reviewsTemplate.push([
                    `[b][url=https://turkopticon.ucsd.edu/${hit.requester_id}]TO[/url]:`,
                    `[Pay: ${ratingColor(toAttrs.pay)}]`,
                    `[Fast: ${ratingColor(toAttrs.fast)}]`,
                    `[Comm: ${ratingColor(toAttrs.comm)}]`,
                    `[Fair: ${ratingColor(toAttrs.fair)}]`,
                    `[Reviews: ${to.reviews}]`,
                    `[ToS: ${goodBadColor(to.tos_flags)}][/b]`
                ].join(` `));
            } else {
                reviewsTemplate.push(`[b][url=https://turkopticon.ucsd.edu/${hit.requester_id}]TO[/url]:[/b] No Reviews`);
            }
        }

        if (storage.reviews.turkopticon2 === true) {
            const to2 = review.turkopticon2;

            if (to2 instanceof Object) {
                const to2Recent = to2.recent;

                reviewsTemplate.push([
                    `[b][url=https://turkopticon.info/requesters/${hit.requester_id}]TO2[/url]:`,
                    `[Hrly: ${to2Recent.reward[1] > 0 ? `${(to2Recent.reward[0] / to2Recent.reward[1] * 3600).toMoneyString()}` : `---`}]`,
                    `[Pen: ${to2Recent.pending > 0 ? `${(to2Recent.pending / 86400).toFixed(2)} days` : `---`}]`,
                    `[Res: ${percentColor(to2Recent.comm)}]`,
                    `[Rec: ${percentColor(to2Recent.recommend)}]`,
                    `[Rej: ${goodBadColor(to2Recent.rejected[0])}]`,
                    `[ToS: ${goodBadColor(to2Recent.tos[0])}]`,
                    `[Brk: ${goodBadColor(to2Recent.broken[0])}][/b]`
                ].join(` `));
            } else {
                reviewsTemplate.push(`[b][url=https://turkopticon.info/requesters/${hit.requester_id}]TO2[/url]:[/b] No Reviews`);
            }
        }
    }

    const exportTemplate = [
        `[b]Title:[/b] [url=https://worker.mturk.com/projects/${hit.hit_set_id}/tasks]${hit.title}[/url] | [url=https://worker.mturk.com/projects/${hit.hit_set_id}/tasks/accept_random]AcceptA[/url]`,
        `[b]Requester:[/b] [url=https://worker.mturk.com/requesters/${hit.requester_id}/projects]${hit.requester_name}[/url] [${hit.requester_id}] [url=https://worker.mturk.com/requesters/${hit.requester_id}]Contact[/url]`,
        reviewsTemplate.join(`\n`),
        `[b]Reward:[/b] ${hit.monetary_reward.amount_in_dollars.toMoneyString()}`,
        `[b]Duration:[/b] ${hit.assignment_duration_in_seconds.toTimeString()}`,
        `[b]Available:[/b] ${hit.assignable_hits_count}`,
        `[b]Description:[/b] ${hit.description}`,
        `[b]Requirements:[/b] ${hit.project_requirements.map(o => `${o.qualification_type.name} ${o.comparator} ${o.qualification_values.map(v => v).join(`, `)}`.trim()).join(`; `) || `None`}`,
    ].filter((item) => item !== undefined && item !== ``).join(`\n`);

    copyTextToClipboard(`[table][tr][td]${exportTemplate}[/td][/tr][/table]`);

    const notification = new Notification(`HIT Export Succesful!`, {
        icon: `/media/icon_128.png`,
        body: `BBCode export has been copied to your clipboard.`,
    });

    setTimeout(notification.close.bind(notification), 10000);
}

async function hitExportMarkdown(arguments, request, sender, sendResponse) {
    const hit = arguments.hit;
    const review = await requesterReviewsGetExport(hit.requester_id);
    const reviewsTemplate = [];

    if (storage.scripts.requesterReviews === true) {
        if (storage.reviews.turkerview === true) {
            const tv = review.turkerview;

            if (tv instanceof Object) {
                const tvRatings = tv.ratings;

                reviewsTemplate.push([
                    `**[TV](https://turkerview.com/requesters/${hit.requester_id}):**`,
                    `[Hrly: $${tvRatings.hourly}]`,
                    `[Pay: ${tvRatings.pay}]`,
                    `[Fast: ${tvRatings.fast}]`,
                    `[Comm: ${tvRatings.comm}]`,
                    `[Rej: ${tv.rejections}]`,
                    `[ToS: ${tv.tos}]`,
                    `[Blk: ${tv.blocks}]`
                ].join(` `));
            } else {
                reviewsTemplate.push(`**[TV](https://turkerview.com/requesters/${hit.requester_id}):** No Reviews`);
            }
        }

        if (storage.reviews.turkopticon === true) {
            const to = review.turkopticon;

            if (to instanceof Object) {
                const toAttrs = to.attrs;

                reviewsTemplate.push([
                    `**[TO](https://turkopticon.ucsd.edu/${hit.requester_id}):**`,
                    `[Pay: ${toAttrs.pay}]`,
                    `[Fast: ${toAttrs.fast}]`,
                    `[Comm: ${toAttrs.comm}]`,
                    `[Fair: ${toAttrs.fair}]`,
                    `[Reviews: ${to.reviews}]`,
                    `[ToS: ${to.tos_flags}]`
                ].join(` `));
            } else {
                reviewsTemplate.push(`**[TO](https://turkopticon.ucsd.edu/${hit.requester_id}):** No Reviews`);
            }
        }

        if (storage.reviews.turkopticon2 === true) {
            const to2 = review.turkopticon2;

            if (to2 instanceof Object) {
                const to2Recent = to2.recent;

                reviewsTemplate.push([
                    `**[TO2](https://turkopticon.info/requesters/${hit.requester_id}):**`,
                    `[Hrly: ${to2Recent.reward[1] > 0 ? `${(to2Recent.reward[0] / to2Recent.reward[1] * 3600).toMoneyString()}` : `---`}]`,
                    `[Pen: ${to2Recent.pending > 0 ? `${(to2Recent.pending / 86400).toFixed(2)} days` : `---`}]`,
                    `[Res: ${to2Recent.comm[1] > 0 ? `${Math.round(to2Recent.comm[0] / to2Recent.comm[1] * 100)}% of ${to2Recent.comm[1]}` : `---`}]`,
                    `[Rec: ${to2Recent.recommend[1] > 0 ? `${Math.round(to2Recent.recommend[0] / to2Recent.recommend[1] * 100)}% of ${to2Recent.recommend[1]}` : `---`}]`,
                    `[Rej: ${to2Recent.rejected[0]}]`,
                    `[ToS: ${to2Recent.tos[0]}]`,
                    `[Brk: ${to2Recent.broken[0]}]`,
                    ``,
                ].join(` `));
            } else {
                reviewsTemplate.push(`**[TO2](https://turkopticon.info/requesters/${hit.requester_id}):** No Reviews`);
            }
        }
    }

    const exportTemplate = [
        `> **Title:** [${hit.title}](https://worker.mturk.com/projects/${hit.hit_set_id}/tasks) | [Accept](https://worker.mturk.com/projects/${hit.hit_set_id}/tasks/accept_random)`,
        `**Requester:** [${hit.requester_name}](https://worker.mturk.com/requesters${hit.requester_id}/projects) [${hit.requester_id}] [Contact](https://worker.mturk.com/contact?requesterId=${hit.requester_id})`,
        reviewsTemplate.join(`  \n`),
        `**Reward:** ${hit.monetary_reward.amount_in_dollars.toMoneyString()}`,
        `**Duration:** ${hit.assignment_duration_in_seconds.toTimeString()}`,
        `**Available:** ${hit.assignable_hits_count}`,
        `**Description:** ${hit.description}`,
        `**Requirements:** ${hit.project_requirements.map(o => `${o.qualification_type.name} ${o.comparator} ${o.qualification_values.map(v => v).join(`, `)}`.trim()).join(`; `) || `None`}`,
    ]
    .filter((item) => item !== undefined && item !== ``).join(`  \n`);

    copyTextToClipboard(exportTemplate);

    const notification = new Notification(`HIT Export Succesful!`, {
        icon: `/media/icon_128.png`,
        body: `Markdown export has been copied to your clipboard.`,
    });

    setTimeout(notification.close.bind(notification), 10000);
}

async function hitExportTurkerHub(arguments, request, sender, sendResponse) {
    async function messageHtml(hit) {
        const template = [];

        function ratingColor(rating) {
            return rating;

            if (rating > 3.99) {
                return `[color=#00cc00]${rating}[/color]`;
            }
            else if (rating > 2.99) {
                return `[color=#cccc00]${rating}[/color]`;
            }
            else if (rating > 1.99) {
                return `[color=#cc6600]${rating}[/color]`;
            }
            else if (rating > 0.00) {
                return `[color=#cc0000]${rating}[/color]`;
            }
            return rating;
        }

        function percentColor(rating) {
            if (rating[1] > 0) {
                const percent = Math.round(rating[0] / rating[1] * 100);

                return `${percent}% of ${rating[1]}`;

                if (percent > 79) {
                    return `[color=#00cc00]${percent}%[/color] of ${rating[1]}`;
                }
                else if (percent > 59) {
                    return `[color=#cccc00]${percent}%[/color] of ${rating[1]}`;
                }
                else if (percent > 39) {
                    return `[color=#cc6600]${percent}%[/color] of ${rating[1]}`;
                }
                return `[color=#cc0000]${percent}%[/color] of ${rating[1]}`;
            }
            return `---`;
        }

        function goodBadColor(rating) {
            return rating;
            return `[color=${rating === 0 ? `#00cc00` : `#cc0000`}]${rating}[/color]`;
        }

        const review = await requesterReviewsGetExport(hit.requester_id);

        if (storage.scripts.requesterReviews === true) {
            if (storage.reviews.turkerview === true) {
                const tv = review.turkerview;

                if (tv instanceof Object) {
                    const tvRatings = tv.ratings;

                    template.push([
                        `[b][url=https://turkerview.com/requesters/${hit.requester_id}]TV[/url]:`,
                        `[Hrly: $${tv.ratings.hourly}]`,
                        `[Pay: ${ratingColor(tv.ratings.pay)}]`,
                        `[Fast: ${ratingColor(tv.ratings.fast)}]`,
                        `[Comm: ${ratingColor(tv.ratings.comm)}]`,
                        `[Rej: ${goodBadColor(tv.rejections)}]`,
                        `[ToS: ${goodBadColor(tv.tos)}]`,
                        `[Blk: ${goodBadColor(tv.blocks)}][/b]`
                    ].join(` `));
                } else {
                    template.push(`[b][url=https://turkerview.com/requesters/${hit.requester_id}]TV[/url]:[/b] No Reviews`);
                }
            }

            if (storage.reviews.turkopticon === true) {
                const to = review.turkopticon;

                if (to instanceof Object) {
                    const toAttrs = to.attrs;

                    template.push([
                        `[b][url=https://turkopticon.ucsd.edu/${hit.requester_id}]TO[/url]:`,
                        `[Pay: ${ratingColor(toAttrs.pay)}]`,
                        `[Fast: ${ratingColor(toAttrs.fast)}]`,
                        `[Comm: ${ratingColor(toAttrs.comm)}]`,
                        `[Fair: ${ratingColor(toAttrs.fair)}]`,
                        `[Reviews: ${to.reviews}]`,
                        `[ToS: ${goodBadColor(to.tos_flags)}][/b]`
                    ].join(` `));
                } else {
                    template.push(`[b][url=https://turkopticon.ucsd.edu/${hit.requester_id}]TO[/url]:[/b] No Reviews`);
                }
            }

            if (storage.reviews.turkopticon2 === true) {
                const to2 = review.turkopticon2;

                if (to2 instanceof Object) {
                    const to2Recent = to2.recent;

                    template.push([
                        `[b][url=https://turkopticon.info/requesters/${hit.requester_id}]TO2[/url]:`,
                        `[Hrly: ${to2Recent.reward[1] > 0 ? `${(to2Recent.reward[0] / to2Recent.reward[1] * 3600).toMoneyString()}` : `---`}]`,
                        `[Pen: ${to2Recent.pending > 0 ? `${(to2Recent.pending / 86400).toFixed(2)} days` : `---`}]`,
                        `[Res: ${percentColor(to2Recent.comm)}]`,
                        `[Rec: ${percentColor(to2Recent.recommend)}]`,
                        `[Rej: ${goodBadColor(to2Recent.rejected[0])}]`,
                        `[ToS: ${goodBadColor(to2Recent.tos[0])}]`,
                        `[Brk: ${goodBadColor(to2Recent.broken[0])}][/b]`
                    ].join(` `));
                } else {
                    template.push(`[b][url=https://turkopticon.info/requesters/${hit.requester_id}]TO2[/url]:[/b] No Reviews`);
                }
            }
        }

        const exportTemplate = [
            `[table][tr][td][b]Title:[/b] [url=https://worker.mturk.com/projects/${hit.hit_set_id}/tasks]${hit.title}[/url] | [url=https://worker.mturk.com/projects/${hit.hit_set_id}/tasks/accept_random]Accept[/url]`,
            `[b]Requester:[/b] [url=https://worker.mturk.com/requesters/${hit.requester_id}/projects]${hit.requester_name}[/url] [${hit.requester_id}] [url=https://worker.mturk.com/requesters/${hit.requester_id}]Contact[/url]`,
            template.filter((item) => item !== undefined && item !== ``).map((currentValue) => `<p>${currentValue}</p>`).join(``),
            `[b]Reward:[/b] ${hit.monetary_reward.amount_in_dollars.toMoneyString()}`,
            `[b]Duration:[/b] ${hit.assignment_duration_in_seconds.toTimeString()}`,
            `[b]Available:[/b] ${hit.assignable_hits_count}`,
            `[b]Description:[/b] ${hit.description}`,
            `[b]Requirements:[/b] ${hit.project_requirements.map(o => `${o.qualification_type.name} ${o.comparator} ${o.qualification_values.map(v => v).join(`, `)}`.trim()).join(`; `) || `None`}`,
            `[tr][td][center][size=2]HIT exported from [url=http://mturksuite.com/]Mturk Suite[/url] v${chrome.runtime.getManifest().version}[/size][/center][/td][/tr][/table]`,

        ].filter((item) => item !== undefined && item !== ``).map((currentValue) => `<p>${currentValue}</p>`).join(``);

        return exportTemplate;
    }

    try {
        const dailyThreads = await fetch(`https://turkerhub.com/forums/daily-mturk-hits-threads.2/?order=post_date&direction=desc`, {
            credentials: `include`
        });
        const dailyThreadsDOM = new DOMParser().parseFromString(await dailyThreads.text(), `text/html`);

        const xfToken = dailyThreadsDOM.getElementsByName(`_xfToken`);

        if (xfToken.length > 0 && xfToken[0].value.length > 0) {
            const newestThread = Math.max(...[...dailyThreadsDOM.querySelectorAll(`li[id^="thread-"]`)].map(element => Number(element.id.replace(/[^0-9.]/g, ``))));

            const checkPosts = await fetch(`https://turkerhub.com/hub.php?action=getPosts&thread_id=${newestThread}&order_by=post_date`, {
                credentials: `include`
            });

            const hit = arguments.hit;
            const json = await checkPosts.json();

            for (const post of json.posts) {
                if (post.message.indexOf(hit.hit_set_id) !== -1) {
                    throw `HIT was recently posted`;
                }
            }

            const postHIT = await fetch(`https://turkerhub.com/threads/${newestThread}/add-reply`, {
                method: `post`,
                body: new URLSearchParams(`_xfToken=${xfToken[0].value}&message_html=${await messageHtml(hit)}`),
                credentials: `include`
            });

            if (postHIT.status === 200) {
                const notification = new Notification(`HIT Export Succesful!`, {
                    icon: `/media/icon_128.png`,
                    body: `Turker Hub export posted on TurkerHub.com`
                });

                setTimeout(notification.close.bind(notification), 10000);
            } else {
                throw `Export post status ${postHIT.status}`;
            }
        }
    } catch (error) {
        new Notification(`HIT Export Failed!`, {
            icon: `/media/icon_128.png`,
            body: `Turker Hub export failed with the error ${error}`
        });
    }
}

async function hitExportMTurkCrowd(arguments, request, sender, sendResponse) {
    async function messageHtml(hit) {
        const template = [];

        function ratingColor(rating) {
            return rating;

            if (rating > 3.99) {
                return `[color=#00cc00]${rating}[/color]`;
            }
            else if (rating > 2.99) {
                return `[color=#cccc00]${rating}[/color]`;
            }
            else if (rating > 1.99) {
                return `[color=#cc6600]${rating}[/color]`;
            }
            else if (rating > 0.00) {
                return `[color=#cc0000]${rating}[/color]`;
            }
            return rating;
        }

        function percentColor(rating) {
            if (rating[1] > 0) {
                const percent = Math.round(rating[0] / rating[1] * 100);

                return `${percent}% of ${rating[1]}`;

                if (percent > 79) {
                    return `[color=#00cc00]${percent}%[/color] of ${rating[1]}`;
                }
                else if (percent > 59) {
                    return `[color=#cccc00]${percent}%[/color] of ${rating[1]}`;
                }
                else if (percent > 39) {
                    return `[color=#cc6600]${percent}%[/color] of ${rating[1]}`;
                }
                return `[color=#cc0000]${percent}%[/color] of ${rating[1]}`;
            }
            return `---`;
        }

        function goodBadColor(rating) {
            return rating;
            return `[color=${rating === 0 ? `#00cc00` : `#cc0000`}]${rating}[/color]`;
        }

        const review = await requesterReviewsGetExport(hit.requester_id);

        if (storage.scripts.requesterReviews === true) {
            if (storage.reviews.turkerview === true) {
                const tv = review.turkerview;

                if (tv instanceof Object) {
                    const tvRatings = tv.ratings;

                    template.push([
                        `[b][url=https://turkerview.com/requesters/${hit.requester_id}]TV[/url]:`,
                        `[Hrly: $${tv.ratings.hourly}]`,
                        `[Pay: ${ratingColor(tv.ratings.pay)}]`,
                        `[Fast: ${ratingColor(tv.ratings.fast)}]`,
                        `[Comm: ${ratingColor(tv.ratings.comm)}]`,
                        `[Rej: ${goodBadColor(tv.rejections)}]`,
                        `[ToS: ${goodBadColor(tv.tos)}]`,
                        `[Blk: ${goodBadColor(tv.blocks)}][/b]`
                    ].join(` `));
                } else {
                    template.push(`[b][url=https://turkerview.com/requesters/${hit.requester_id}]TV[/url]:[/b] No Reviews`);
                }
            }

            if (storage.reviews.turkopticon === true) {
                const to = review.turkopticon;

                if (to instanceof Object) {
                    const toAttrs = to.attrs;

                    template.push([
                        `[b][url=https://turkopticon.ucsd.edu/${hit.requester_id}]TO[/url]:`,
                        `[Pay: ${ratingColor(toAttrs.pay)}]`,
                        `[Fast: ${ratingColor(toAttrs.fast)}]`,
                        `[Comm: ${ratingColor(toAttrs.comm)}]`,
                        `[Fair: ${ratingColor(toAttrs.fair)}]`,
                        `[Reviews: ${to.reviews}]`,
                        `[ToS: ${goodBadColor(to.tos_flags)}][/b]`
                    ].join(` `));
                } else {
                    template.push(`[b][url=https://turkopticon.ucsd.edu/${hit.requester_id}]TO[/url]:[/b] No Reviews`);
                }
            }

            if (storage.reviews.turkopticon2 === true) {
                const to2 = review.turkopticon2;

                if (to2 instanceof Object) {
                    const to2Recent = to2.recent;

                    template.push([
                        `[b][url=https://turkopticon.info/requesters/${hit.requester_id}]TO2[/url]:`,
                        `[Hrly: ${to2Recent.reward[1] > 0 ? `${(to2Recent.reward[0] / to2Recent.reward[1] * 3600).toMoneyString()}` : `---`}]`,
                        `[Pen: ${to2Recent.pending > 0 ? `${(to2Recent.pending / 86400).toFixed(2)} days` : `---`}]`,
                        `[Res: ${percentColor(to2Recent.comm)}]`,
                        `[Rec: ${percentColor(to2Recent.recommend)}]`,
                        `[Rej: ${goodBadColor(to2Recent.rejected[0])}]`,
                        `[ToS: ${goodBadColor(to2Recent.tos[0])}]`,
                        `[Brk: ${goodBadColor(to2Recent.broken[0])}][/b]`
                    ].join(` `));
                } else {
                    template.push(`[b][url=https://turkopticon.info/requesters/${hit.requester_id}]TO2[/url]:[/b] No Reviews`);
                }
            }
        }

        const exportTemplate = [
            `[table][tr][td][b]Title:[/b] [url=https://worker.mturk.com/projects/${hit.hit_set_id}/tasks]${hit.title}[/url] | [url=https://worker.mturk.com/projects/${hit.hit_set_id}/tasks/accept_random]Accept[/url]`,
            `[b]Requester:[/b] [url=https://worker.mturk.com/requesters/${hit.requester_id}/projects]${hit.requester_name}[/url] [${hit.requester_id}] [url=https://worker.mturk.com/requesters/${hit.requester_id}]Contact[/url]`,
            template.filter((item) => item !== undefined && item !== ``).map((currentValue) => `<p>${currentValue}</p>`).join(``),
            `[b]Reward:[/b] ${hit.monetary_reward.amount_in_dollars.toMoneyString()}`,
            `[b]Duration:[/b] ${hit.assignment_duration_in_seconds.toTimeString()}`,
            `[b]Available:[/b] ${hit.assignable_hits_count}`,
            `[b]Description:[/b] ${hit.description}`,
            `[b]Requirements:[/b] ${hit.project_requirements.map(o => `${o.qualification_type.name} ${o.comparator} ${o.qualification_values.map(v => v).join(`, `)}`.trim()).join(`; `) || `None`}`,
            `[tr][td][center][size=2]HIT exported from [url=http://mturksuite.com/]Mturk Suite[/url] v${chrome.runtime.getManifest().version}[/size][/center][/td][/tr][/table]`,

        ].filter((item) => item !== undefined && item !== ``).map((currentValue) => `<p>${currentValue}</p>`).join(``);

        return exportTemplate;
    }

    try {
        const dailyThreads = await fetch(`https://www.mturkcrowd.com/forums/4/?order=post_date&direction=desc`, {
            credentials: `include`
        });
        const dailyThreadsDOM = new DOMParser().parseFromString(await dailyThreads.text(), `text/html`);

        const xfToken = dailyThreadsDOM.getElementsByName(`_xfToken`);

        if (xfToken.length > 0 && xfToken[0].value.length > 0) {
            const newestThread = Math.max(...[...dailyThreadsDOM.querySelectorAll(`li[id^="thread-"]`)].map(element => Number(element.id.replace(/[^0-9.]/g, ``))));

            const checkPosts = await fetch(`https://www.mturkcrowd.com/api.php?action=getPosts&thread_id=${newestThread}&order_by=post_date`, {
                credentials: `include`
            });

            const hit = arguments.hit;
            const json = await checkPosts.json();

            for (const post of json.posts) {
                if (post.message.indexOf(hit.hit_set_id) !== -1) {
                    throw `HIT was recently posted`;
                }
            }

            const postHIT = await fetch(`https://www.mturkcrowd.com/threads/${newestThread}/add-reply`, {
                method: `post`,
                body: new URLSearchParams(`_xfToken=${xfToken[0].value}&message_html=${await messageHtml(hit)}`),
                credentials: `include`
            });

            if (postHIT.status === 200) {
                const notification = new Notification(`HIT Export Succesful!`, {
                    icon: `/media/icon_128.png`,
                    body: `MTurk Crowd export posted on MTurkCrowd.com`
                });

                setTimeout(notification.close.bind(notification), 10000);
            } else {
                throw `Export post status ${postHIT.status}`;
            }
        }
    } catch (error) {
        new Notification(`HIT Export Failed!`, {
            icon: `/media/icon_128.png`,
            body: `MTurk Crowd export failed with the error ${error}`
        });
    }
}


//********** Requester Reviews **********//
let requesterReviewsDB;

(() => {
    const open = window.indexedDB.open(`requesterReviewsDB`, 1);

    open.onsuccess = (event) => {
        requesterReviewsDB = event.target.result;
    };
    open.onupgradeneeded = (event) => {
        requesterReviewsDB = event.target.result;

        requesterReviewsDB.createObjectStore(`requester`, { keyPath: `id` });
    };
})();

function requesterReviewsGet(arguments, request, sender, sendResponse) {
    const time = new Date().getTime();
    const reviews = {};
    const transaction = requesterReviewsDB.transaction([`requester`], `readonly`);
    const objectStore = transaction.objectStore(`requester`);

    let update = false;

    for (let i = 0; i < arguments.requesters.length; i++) {
        const id = arguments.requesters[i];
        const request = objectStore.get(id);

        request.onsuccess = (event) => {
            if (event.target.result) {
                reviews[id] = event.target.result;

                if (event.target.result.time < (time - 3600000 / 2)) {
                    update = true;
                }
            } else {
                reviews[id] = {
                    id: id
                };
                update = true;
            }
        };
    }

    transaction.oncomplete = async (event) => {
        if (update) {
            const updatedReviews = await requesterReviewsUpdate(reviews, arguments.requesters);
            sendResponse(updatedReviews);
        } else {
            sendResponse(reviews);
        }
    };
}

function requesterReviewsGetExport(id) {
    return new Promise((resolve) => {
        const transaction = requesterReviewsDB.transaction([`requester`], `readonly`);
        const objectStore = transaction.objectStore(`requester`);
        const request = objectStore.get(id);

        request.onsuccess = (event) => {
            resolve(event.target.result ? event.target.result : null);
        };
    });
}

function requesterReviewsUpdate(objectReviews, arrayIds) {
    return new Promise(async (resolve) => {
        const getReviews = (stringSite, stringURL) => {
            return new Promise(async (resolve) => {
                try {
                    const response = await fetch(stringURL);

                    if (response.status === 200) {
                        const json = await response.json();
                        resolve([stringSite, json.data ? Object.assign(...json.data.map((item) => ({
                            [item.id]: item.attributes.aggregates
                        }))) : json]);
                    } else {
                        resolve();
                    }
                } catch (error) {
                    resolve();
                }
            });
        };

        const getReviewsAll = await Promise.all([
            getReviews(`turkerview`, `https://api.turkerview.com/api/v1/requesters/?ids=${arrayIds}&from=mts`),
            getReviews(`turkopticon`, `https://turkopticon.ucsd.edu/api/multi-attrs.php?ids=${arrayIds}`),
            getReviews(`turkopticon2`, `https://api.turkopticon.info/requesters?rids=${arrayIds}&fields[requesters]=aggregates`)
        ]);

        for (const item of getReviewsAll) {
            if (item && item.length > 0) {
                const site = item[0];
                const reviews = item[1];

                for (const key in reviews) {
                    objectReviews[key][site] = reviews[key];
                }
            }
        }

        const time = new Date().getTime();
        const transaction = requesterReviewsDB.transaction([`requester`], `readwrite`);
        const objectStore = transaction.objectStore(`requester`);

        for (const key in objectReviews) {
            const obj = objectReviews[key];

            obj.id = key;
            obj.time = time;
            objectStore.put(obj);
        }

        resolve(objectReviews);
    });
}


//********** Storage  **********//
const storage = new Object();

(async () => {
    const items = await new Promise((resolve) => chrome.storage.local.get([`exports`, `reviews`, `scripts`, `themes`, `version`, `workerID`], resolve));

    ((object) => {
        const themes = [`mts`, `mturk`];

        storage.themes = new Object();

        if (object !== undefined) {
            for (const value of themes) {
                storage.themes[value] = object[value] !== undefined ? object[value] : `default`;
            }
        } else {
            for (const value of themes) {
                storage.themes[value] = `default`;
            }
        }

        chrome.storage.local.set({
            themes: storage.themes
        });
    })(items.themes);


    ((string) => {
        const exports = [`all`, `short`, `plain`, `bbcode`, `markdown`, `turkerhub`, `mturkcrowd`];

        storage.exports = exports.includes(string) === true ? string : `all`;

        chrome.storage.local.set({
            exports: storage.exports
        });
    })(items.exports);

    ((object) => {
        const reviews = [`turkerview`, `turkopticon`, `turkopticon2`];

        storage.reviews = new Object();

        if (object !== undefined) {
            for (const value of reviews) {
                storage.reviews[value] = object[value] !== undefined ? object[value] : true;
            }
        } else {
            for (const value of reviews) {
                storage.reviews[value] = true;
            }
        }

        chrome.storage.local.set({
            reviews: storage.reviews
        });
    })(items.reviews);

    ((object) => {
        const scripts = [
            `autoAcceptChecker`, `confirmReturnHIT`, `dashboardEnhancer`, `hitExporter`, `hitTracker`,
            `hitDetailsEnhancer`, `queueInfoEnhancer`, `rateLimitReloader`, `requesterReviews`, `workspaceExpander`
        ];

        storage.scripts = new Object();

        if (object !== undefined) {
            for (const value of scripts) {
                storage.scripts[value] = object[value] !== undefined ? object[value] : true;
            }
        } else {
            for (const value of scripts) {
                storage.scripts[value] = true;
            }
        }

        chrome.storage.local.set({
            scripts: storage.scripts
        });
    })(items.scripts);

    ((string) => {
        const version = chrome.runtime.getManifest().version;

        if (string !== version) {
            chrome.tabs.create({
                url: `/change_log/change_log.html`
            });
            chrome.storage.local.set({
                version: version
            });
        }
    })(items.version);

    ((string) => {
        storage.workerID = string || `A-------------`;
    })(items.workerID);

    chrome.storage.onChanged.addListener((changes) => {
        for (const value of [`reviews`, `scripts`, `workerID`]) {
            if (changes[value] !== undefined) {
                storage[value] = changes[value].newValue;
            }
        }
    });
})();

//********** HIT Tracker **********//
let hitTrackerDB;

(() => {
    const open = window.indexedDB.open(`hitTrackerDB`, 1);

    open.onsuccess = (event) => {
        hitTrackerDB = event.target.result;
        hitTrackerGetProjected();
    };
    open.onupgradeneeded = (event) => {
        hitTrackerDB = event.target.result;

        const hitObjectStore = hitTrackerDB.createObjectStore(`hit`, {
            keyPath: `hit_id`
        });

        for (const value of [`requester_id`, `requester_name`, `state`, `title`, `date`]) {
            hitObjectStore.createIndex(value, value, {
                unique: false
            });
        }

        const dayObjectStore = hitTrackerDB.createObjectStore(`day`, {
            keyPath: `date`
        });

        for (const value of [`assigned`, `returned`, `abandoned`, `submitted`, `approved`, `rejected`, `pending`, `earnings`]) {
            dayObjectStore.createIndex(value, value, {
                unique: false
            });
        }
    };
})();

const accepted = new Object();

function hitTrackerUpdate(arguments) {
    const hit = arguments.hit;
    const assignment_id = arguments.assignment_id;

    accepted[assignment_id] = hit.hit_id;

    const objectStore = hitTrackerDB.transaction([`hit`], `readwrite`).objectStore(`hit`);
    objectStore.put(hit);
}

function hitTrackerSubmitted(arguments) {
    const data = arguments.data;
    const hitId = accepted[data.assignmentId];

    if (typeof hitId === `string`) {
        const transaction = hitTrackerDB.transaction([`hit`], `readwrite`);
        const objectStore = transaction.objectStore(`hit`);
        const request = objectStore.get(hitId);

        request.onerror = (event) => {};
        request.onsuccess = (event) => {
            const result = event.target.result;

            result.answer = data.answer;
            result.state = `Submitted`;

            objectStore.put(result);
        };

        transaction.oncomplete = (event) => {
            hitTrackerGetProjected();     
        };
    }
}

function hitTrackerGetProjected() {
    let projected = 0;

    const transaction = hitTrackerDB.transaction([`hit`], `readonly`);
    const objectStore = transaction.objectStore(`hit`);
    const index = objectStore.index(`date`);
    const range = IDBKeyRange.only(mturkDate());

    index.openCursor(range).onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
            const hit = cursor.value;

            if (hit.state.match(/Submitted|Pending|Approved|Paid/)) {
                projected += hit.reward.amount_in_dollars;
            }

            cursor.continue();
        }
    };

    transaction.oncomplete = (event) => {
        chrome.storage.local.set({
            earnings: projected
        });
    };
}

function hitTrackerGetCounts(arguments, request, sender, sendResponse) {
    const transaction = hitTrackerDB.transaction([`hit`], `readonly`);
    const objectStore = transaction.objectStore(`hit`);
    const requesterIndex = objectStore.index(`requester_id`);
    const titleIndex = objectStore.index(`title`);

    const counts = {};

    for (const item of arguments.requester_id) {
        counts[item] = {};

        const range = IDBKeyRange.only(item);
        
        requesterIndex.openCursor(range).onsuccess = (event) => {
            const cursor = event.target.result;

            if (cursor) {
                const value = cursor.value;
                const state = value.state
                const count = counts[item][state];
                counts[item][state] = count ? count + 1 : 1;
                cursor.continue();
            }
        };
    }
    
    for (const item of arguments.title) {
        counts[item] = {};

        const range = IDBKeyRange.only(item);
        
        titleIndex.openCursor(range).onsuccess = (event) => {
            const cursor = event.target.result;

            if (cursor) {
                const value = cursor.value;
                const state = value.state
                const count = counts[item][state];
                counts[item][state] = count ? count + 1 : 1;
                cursor.continue();
            }
        };
    }
    
    transaction.oncomplete = (event) => {
        sendResponse(counts);
    };
}

function openTracker() {
    chrome.tabs.create({ url: chrome.runtime.getURL(`hit_tracker/hit_tracker.html`) });
}

function mturkDate() {
    function dst() {
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

    const given = new Date();
    const utc = given.getTime() + (given.getTimezoneOffset() * 60000);
    const offset = dst() === true ? `-7` : `-8`;
    const amz = new Date(utc + (3600000 * offset));
    const day = (amz.getDate()) < 10 ? `0` + (amz.getDate()).toString() : (amz.getDate()).toString();
    const month = (amz.getMonth() + 1) < 10 ? `0` + (amz.getMonth() + 1).toString() : ((amz.getMonth() + 1)).toString();
    const year = (amz.getFullYear()).toString();
    return year + month + day;
}

Object.assign(String.prototype, {
    num() {
        return Number(this.replace(/[^0-9.]/g, ``))
    },
    sanitize() {
        return this.replace(/</g, `&lt;`).replace(/>/g, `&gt;`)
    },
    toCamelCase() {
        return this.replace(/\W+(.)/g, (match, character) => character.toUpperCase());
    }
});

Object.assign(Number.prototype, {
    toMoneyString() {
        return `$${this.toFixed(2).toLocaleString(`en-US`, { minimumFractionDigits: 2 })}`;
    },
    toTimeString () {
        let day, hour, minute, seconds = this;
        minute = Math.floor(seconds / 60);
        seconds = seconds % 60;
        hour = Math.floor(minute / 60);
        minute = minute % 60;
        day = Math.floor(hour / 24);
        hour = hour % 24;

        let string = ``;

        if (day > 0) {
            string += `${day} day${day > 1 ? `s` : ``} `;
        }
        if (hour > 0) {
            string += `${hour} hour${hour > 1 ? `s` : ``} `;
        }
        if (minute > 0) {
            string += `${minute} minute${minute > 1 ? `s` : ``}`;
        }
        return string.trim();
    }
});

function copyTextToClipboard(string) {
    const textarea = document.createElement(`textarea`);
    textarea.textContent = string;
    document.body.appendChild(textarea);

    textarea.select();
    document.execCommand(`copy`);

    document.body.removeChild(textarea);
}












