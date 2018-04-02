/* globals storage requesterReviewsGetExport */

// Checks to see if the message is for hit exporter and run the hit exporter function if true.
function hitExporterListener (request, sender, sendResponse) {
  switch (request.function) {
    case `hitExportShort`: hitExportShort(...arguments); break
    case `hitExportPlain`: hitExportPlain(...arguments); break
    case `hitExportBBCode`: hitExportBBCode(...arguments); break
    case `hitExportMarkdown`: hitExportMarkdown(...arguments); break
    case `hitExportTurkerHub`: hitExportTurkerHub(...arguments); break
    case `hitExportMTurkCrowd`: hitExportMTurkCrowd(...arguments); break
  }
}

// Exports the HIT in the short format.
async function hitExportShort (request, sender, sendResponse) {
  const hit = request.data.hit
  const masters = hit.project_requirements.filter((o) => [`2F1QJWKUDD8XADTFD2Q0G6UTO95ALH`, `2NDP2L92HECWY8NS8H3CK0CP5L9GHO`, `21VZU98JHSTLZ5BPP4A9NOBJEK3DPG`].includes(o.qualification_type_id)).length ? `MASTERS • ` : ``

  const fetchUrl = new window.URL(`https://ns4t.net/yourls-api.php?action=bulkshortener&title=MTurk&signature=39f6cf4959`)
  fetchUrl.searchParams.append(`urls[]`, `https://worker.mturk.com/requesters${hit.requester_id}/projects`)
  fetchUrl.searchParams.append(`urls[]`, `https://worker.mturk.com/projects/${hit.hit_set_id}/tasks`)
  fetchUrl.searchParams.append(`urls[]`, `https://worker.mturk.com/projects/${hit.hit_set_id}/tasks/accept_random`)

  const response = await window.fetch(fetchUrl)

  if (response.ok) {
    const responseText = await response.text()
    const links = responseText.split(`;`)

    const exportTemplate = `${masters}${hit.requester_name} ${links[0]} • ${hit.title} ${links[1]}` +
  ` • ${hit.monetary_reward.amount_in_dollars.toMoneyString()} • Accept: ${links[2]} • ${hit.hit_set_id}`

    copyTextToClipboard(exportTemplate)
  } else {
    const exportTemplate = `${masters}${hit.requester_name} • ${hit.title} • ${hit.monetary_reward.amount_in_dollars.toMoneyString()}` +
    ` Preview: https://worker.mturk.com/projects/${hit.hit_set_id}/tasks • Accept: https://worker.mturk.com/projects/${hit.hit_set_id}/tasks/accept_random`

    copyTextToClipboard(exportTemplate)
  }

  const notification = new window.Notification(`HIT Export Successful!`, {
    icon: `/media/icon_128.png`,
    body: `Short export has been copied to your clipboard.`
  })

  setTimeout(notification.close.bind(notification), 10000)
}

async function hitExportPlain (request, sender, sendResponse) {
  const hit = request.data.hit
  const review = await requesterReviewsGetExport(hit.requester_id)
  const reviewsTemplate = []

  if (storage.scripts.requesterReviews === true) {
    if (storage.reviews.turkerview === true) {
      const tv = review.turkerview

      if (tv instanceof Object) {
        const tvRatings = tv.ratings

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
        ].join(` `))
      } else {
        reviewsTemplate.push(`TV: No Reviews • https://turkerview.com/requesters/${hit.requester_id}`)
      }
    }

    if (storage.reviews.turkopticon === true) {
      const to = review.turkopticon

      if (to instanceof Object) {
        const toAttrs = to.attrs

        reviewsTemplate.push([
          `TO:`,
          `[Pay: ${toAttrs.pay}]`,
          `[Fast: ${toAttrs.fast}]`,
          `[Comm: ${toAttrs.comm}]`,
          `[Fair: ${toAttrs.fair}]`,
          `[Reviews: ${to.reviews}]`,
          `[ToS: ${to.tos_flags}]`,
          `• https://turkopticon.ucsd.edu/${hit.requester_id}`
        ].join(` `))
      } else {
        reviewsTemplate.push(`TO: No Reviews • https://turkopticon.ucsd.edu/${hit.requester_id}`)
      }
    }

    if (storage.reviews.turkopticon2 === true) {
      const to2 = review.turkopticon2

      if (to2 instanceof Object) {
        const to2Recent = to2.recent

        reviewsTemplate.push([
          `TO2:`,
          `[Hrly: ${to2Recent.reward[1] > 0 ? `${(to2Recent.reward[0] / to2Recent.reward[1] * 3600).toMoneyString()}` : `---`}]`,
          `[Pen: ${to2Recent.pending > 0 ? `${(to2Recent.pending / 86400).toFixed(2)} days` : `---`}]`,
          `[Res: ${to2Recent.comm[1] > 0 ? `${Math.round(to2Recent.comm[0] / to2Recent.comm[1] * 100)}% of ${to2Recent.comm[1]}` : `---`}]`,
          `[Rec: ${to2Recent.recommend[1] > 0 ? `${Math.round(to2Recent.recommend[0] / to2Recent.recommend[1] * 100)}% of ${to2Recent.recommend[1]}` : `---`}]`,
          `[Rej: ${to2Recent.rejected[0]}]`,
          `[ToS: ${to2Recent.tos[0]}]`,
          `[Brk: ${to2Recent.broken[0]}]`,
          `https://turkopticon.info/requesters/${hit.requester_id}`
        ].join(` `))
      } else {
        reviewsTemplate.push(`TO2: No Reviews • https://turkopticon.info/requesters/${hit.requester_id}`)
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
  ].filter((item) => item !== undefined && item !== ``).join(`\n`)

  copyTextToClipboard(exportTemplate)

  const notification = new window.Notification(`HIT Export Successful!`, {
    icon: `/media/icon_128.png`,
    body: `Plain export has been copied to your clipboard.`
  })

  setTimeout(notification.close.bind(notification), 10000)
}

async function hitExportBBCode (request, sender, sendResponse) {
  const hit = request.data.hit
  const review = await requesterReviewsGetExport(hit.requester_id)
  const reviewsTemplate = []

  function ratingColor (rating) {
    return rating
    /*
    if (rating > 3.99) {
      return `[color=#00cc00]${rating}[/color]`
    } else if (rating > 2.99) {
      return `[color=#cccc00]${rating}[/color]`
    } else if (rating > 1.99) {
      return `[color=#cc6600]${rating}[/color]`
    } else if (rating > 0.00) {
      return `[color=#cc0000]${rating}[/color]`
    }
    return rating
    */
  }

  function percentColor (rating) {
    if (rating[1] > 0) {
      const percent = Math.round(rating[0] / rating[1] * 100)

      return `${percent}% of ${rating[1]}`

      /*
      if (percent > 79) {
        return `[color=#00cc00]${percent}%[/color] of ${rating[1]}`
      } else if (percent > 59) {
        return `[color=#cccc00]${percent}%[/color] of ${rating[1]}`
      } else if (percent > 39) {
        return `[color=#cc6600]${percent}%[/color] of ${rating[1]}`
      }
      return `[color=#cc0000]${percent}%[/color] of ${rating[1]}`
      */
    }
    return `---`
  }

  function goodBadColor (rating) {
    return rating
    // return `[color=${rating === 0 ? `#00cc00` : `#cc0000`}]${rating}[/color]`
  }

  if (storage.scripts.requesterReviews === true) {
    if (storage.reviews.turkerview === true) {
      const tv = review.turkerview

      if (tv instanceof Object) {
        reviewsTemplate.push([
          `[b][url=https://turkerview.com/requesters/${hit.requester_id}]TV[/url]:`,
          `[Hrly: $${tv.ratings.hourly}]`,
          `[Pay: ${ratingColor(tv.ratings.pay)}]`,
          `[Fast: ${ratingColor(tv.ratings.fast)}]`,
          `[Comm: ${ratingColor(tv.ratings.comm)}]`,
          `[Rej: ${goodBadColor(tv.rejections)}]`,
          `[ToS: ${goodBadColor(tv.tos)}]`,
          `[Blk: ${goodBadColor(tv.blocks)}][/b]`
        ].join(` `))
      } else {
        reviewsTemplate.push(`[b][url=https://turkerview.com/requesters/${hit.requester_id}]TV[/url]:[/b] No Reviews`)
      }
    }

    if (storage.reviews.turkopticon === true) {
      const to = review.turkopticon

      if (to instanceof Object) {
        const toAttrs = to.attrs

        reviewsTemplate.push([
          `[b][url=https://turkopticon.ucsd.edu/${hit.requester_id}]TO[/url]:`,
          `[Pay: ${ratingColor(toAttrs.pay)}]`,
          `[Fast: ${ratingColor(toAttrs.fast)}]`,
          `[Comm: ${ratingColor(toAttrs.comm)}]`,
          `[Fair: ${ratingColor(toAttrs.fair)}]`,
          `[Reviews: ${to.reviews}]`,
          `[ToS: ${goodBadColor(to.tos_flags)}][/b]`
        ].join(` `))
      } else {
        reviewsTemplate.push(`[b][url=https://turkopticon.ucsd.edu/${hit.requester_id}]TO[/url]:[/b] No Reviews`)
      }
    }

    if (storage.reviews.turkopticon2 === true) {
      const to2 = review.turkopticon2

      if (to2 instanceof Object) {
        const to2Recent = to2.recent

        reviewsTemplate.push([
          `[b][url=https://turkopticon.info/requesters/${hit.requester_id}]TO2[/url]:`,
          `[Hrly: ${to2Recent.reward[1] > 0 ? `${(to2Recent.reward[0] / to2Recent.reward[1] * 3600).toMoneyString()}` : `---`}]`,
          `[Pen: ${to2Recent.pending > 0 ? `${(to2Recent.pending / 86400).toFixed(2)} days` : `---`}]`,
          `[Res: ${percentColor(to2Recent.comm)}]`,
          `[Rec: ${percentColor(to2Recent.recommend)}]`,
          `[Rej: ${goodBadColor(to2Recent.rejected[0])}]`,
          `[ToS: ${goodBadColor(to2Recent.tos[0])}]`,
          `[Brk: ${goodBadColor(to2Recent.broken[0])}][/b]`
        ].join(` `))
      } else {
        reviewsTemplate.push(`[b][url=https://turkopticon.info/requesters/${hit.requester_id}]TO2[/url]:[/b] No Reviews`)
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
    `[b]Requirements:[/b] ${hit.project_requirements.map(o => `${o.qualification_type.name} ${o.comparator} ${o.qualification_values.map(v => v).join(`, `)}`.trim()).join(`; `) || `None`}`
  ].filter((item) => item !== undefined && item !== ``).join(`\n`)

  copyTextToClipboard(`[table][tr][td]${exportTemplate}[/td][/tr][/table]`)

  const notification = new window.Notification(`HIT Export Successful!`, {
    icon: `/media/icon_128.png`,
    body: `BBCode export has been copied to your clipboard.`
  })

  setTimeout(notification.close.bind(notification), 10000)
}

async function hitExportMarkdown (request, sender, sendResponse) {
  const hit = request.data.hit
  const review = await requesterReviewsGetExport(hit.requester_id)
  const reviewsTemplate = []

  if (storage.scripts.requesterReviews === true) {
    if (storage.reviews.turkerview === true) {
      const tv = review.turkerview

      if (tv instanceof Object) {
        const tvRatings = tv.ratings

        reviewsTemplate.push([
          `**[TV](https://turkerview.com/requesters/${hit.requester_id}):**`,
          `[Hrly: $${tvRatings.hourly}]`,
          `[Pay: ${tvRatings.pay}]`,
          `[Fast: ${tvRatings.fast}]`,
          `[Comm: ${tvRatings.comm}]`,
          `[Rej: ${tv.rejections}]`,
          `[ToS: ${tv.tos}]`,
          `[Blk: ${tv.blocks}]`
        ].join(` `))
      } else {
        reviewsTemplate.push(`**[TV](https://turkerview.com/requesters/${hit.requester_id}):** No Reviews`)
      }
    }

    if (storage.reviews.turkopticon === true) {
      const to = review.turkopticon

      if (to instanceof Object) {
        const toAttrs = to.attrs

        reviewsTemplate.push([
          `**[TO](https://turkopticon.ucsd.edu/${hit.requester_id}):**`,
          `[Pay: ${toAttrs.pay}]`,
          `[Fast: ${toAttrs.fast}]`,
          `[Comm: ${toAttrs.comm}]`,
          `[Fair: ${toAttrs.fair}]`,
          `[Reviews: ${to.reviews}]`,
          `[ToS: ${to.tos_flags}]`
        ].join(` `))
      } else {
        reviewsTemplate.push(`**[TO](https://turkopticon.ucsd.edu/${hit.requester_id}):** No Reviews`)
      }
    }

    if (storage.reviews.turkopticon2 === true) {
      const to2 = review.turkopticon2

      if (to2 instanceof Object) {
        const to2Recent = to2.recent

        reviewsTemplate.push([
          `**[TO2](https://turkopticon.info/requesters/${hit.requester_id}):**`,
          `[Hrly: ${to2Recent.reward[1] > 0 ? `${(to2Recent.reward[0] / to2Recent.reward[1] * 3600).toMoneyString()}` : `---`}]`,
          `[Pen: ${to2Recent.pending > 0 ? `${(to2Recent.pending / 86400).toFixed(2)} days` : `---`}]`,
          `[Res: ${to2Recent.comm[1] > 0 ? `${Math.round(to2Recent.comm[0] / to2Recent.comm[1] * 100)}% of ${to2Recent.comm[1]}` : `---`}]`,
          `[Rec: ${to2Recent.recommend[1] > 0 ? `${Math.round(to2Recent.recommend[0] / to2Recent.recommend[1] * 100)}% of ${to2Recent.recommend[1]}` : `---`}]`,
          `[Rej: ${to2Recent.rejected[0]}]`,
          `[ToS: ${to2Recent.tos[0]}]`,
          `[Brk: ${to2Recent.broken[0]}]`,
          ``
        ].join(` `))
      } else {
        reviewsTemplate.push(`**[TO2](https://turkopticon.info/requesters/${hit.requester_id}):** No Reviews`)
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
    `**Requirements:** ${hit.project_requirements.map(o => `${o.qualification_type.name} ${o.comparator} ${o.qualification_values.map(v => v).join(`, `)}`.trim()).join(`; `) || `None`}`
  ]
    .filter((item) => item !== undefined && item !== ``).join(`  \n`)

  copyTextToClipboard(exportTemplate)

  const notification = new window.Notification(`HIT Export Successful!`, {
    icon: `/media/icon_128.png`,
    body: `Markdown export has been copied to your clipboard.`
  })

  setTimeout(notification.close.bind(notification), 10000)
}

async function hitExportTurkerHub (request, sender, sendResponse) {
  async function messageHtml (hit) {
    const template = []

    function ratingColor (rating) {
      return rating

      /*
      if (rating > 3.99) {
        return `[color=#00cc00]${rating}[/color]`
      } else if (rating > 2.99) {
        return `[color=#cccc00]${rating}[/color]`
      } else if (rating > 1.99) {
        return `[color=#cc6600]${rating}[/color]`
      } else if (rating > 0.00) {
        return `[color=#cc0000]${rating}[/color]`
      }
      return rating
      */
    }

    function percentColor (rating) {
      if (rating[1] > 0) {
        const percent = Math.round(rating[0] / rating[1] * 100)

        return `${percent}% of ${rating[1]}`

        /*
        if (percent > 79) {
          return `[color=#00cc00]${percent}%[/color] of ${rating[1]}`
        } else if (percent > 59) {
          return `[color=#cccc00]${percent}%[/color] of ${rating[1]}`
        } else if (percent > 39) {
          return `[color=#cc6600]${percent}%[/color] of ${rating[1]}`
        }
        return `[color=#cc0000]${percent}%[/color] of ${rating[1]}`
        */
      }
      return `---`
    }

    function goodBadColor (rating) {
      return rating
      // return `[color=${rating === 0 ? `#00cc00` : `#cc0000`}]${rating}[/color]`
    }

    const review = await requesterReviewsGetExport(hit.requester_id)

    if (storage.scripts.requesterReviews === true) {
      if (storage.reviews.turkerview === true) {
        const tv = review.turkerview

        if (tv instanceof Object) {
          template.push([
            `[b][url=https://turkerview.com/requesters/${hit.requester_id}]TV[/url]:`,
            `[Hrly: $${tv.ratings.hourly}]`,
            `[Pay: ${ratingColor(tv.ratings.pay)}]`,
            `[Fast: ${ratingColor(tv.ratings.fast)}]`,
            `[Comm: ${ratingColor(tv.ratings.comm)}]`,
            `[Rej: ${goodBadColor(tv.rejections)}]`,
            `[ToS: ${goodBadColor(tv.tos)}]`,
            `[Blk: ${goodBadColor(tv.blocks)}][/b]`
          ].join(` `))
        } else {
          template.push(`[b][url=https://turkerview.com/requesters/${hit.requester_id}]TV[/url]:[/b] No Reviews`)
        }
      }

      if (storage.reviews.turkopticon === true) {
        const to = review.turkopticon

        if (to instanceof Object) {
          const toAttrs = to.attrs

          template.push([
            `[b][url=https://turkopticon.ucsd.edu/${hit.requester_id}]TO[/url]:`,
            `[Pay: ${ratingColor(toAttrs.pay)}]`,
            `[Fast: ${ratingColor(toAttrs.fast)}]`,
            `[Comm: ${ratingColor(toAttrs.comm)}]`,
            `[Fair: ${ratingColor(toAttrs.fair)}]`,
            `[Reviews: ${to.reviews}]`,
            `[ToS: ${goodBadColor(to.tos_flags)}][/b]`
          ].join(` `))
        } else {
          template.push(`[b][url=https://turkopticon.ucsd.edu/${hit.requester_id}]TO[/url]:[/b] No Reviews`)
        }
      }

      if (storage.reviews.turkopticon2 === true) {
        const to2 = review.turkopticon2

        if (to2 instanceof Object) {
          const to2Recent = to2.recent

          template.push([
            `[b][url=https://turkopticon.info/requesters/${hit.requester_id}]TO2[/url]:`,
            `[Hrly: ${to2Recent.reward[1] > 0 ? `${(to2Recent.reward[0] / to2Recent.reward[1] * 3600).toMoneyString()}` : `---`}]`,
            `[Pen: ${to2Recent.pending > 0 ? `${(to2Recent.pending / 86400).toFixed(2)} days` : `---`}]`,
            `[Res: ${percentColor(to2Recent.comm)}]`,
            `[Rec: ${percentColor(to2Recent.recommend)}]`,
            `[Rej: ${goodBadColor(to2Recent.rejected[0])}]`,
            `[ToS: ${goodBadColor(to2Recent.tos[0])}]`,
            `[Brk: ${goodBadColor(to2Recent.broken[0])}][/b]`
          ].join(` `))
        } else {
          template.push(`[b][url=https://turkopticon.info/requesters/${hit.requester_id}]TO2[/url]:[/b] No Reviews`)
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
      `[tr][td][center][size=2]HIT exported from [url=http://mturksuite.com/]Mturk Suite[/url] v${chrome.runtime.getManifest().version}[/size][/center][/td][/tr][/table]`

    ].filter((item) => item !== undefined && item !== ``).map((currentValue) => `<p>${currentValue}</p>`).join(``)

    return exportTemplate
  }

  try {
    const dailyThreads = await window.fetch(`https://turkerhub.com/forums/daily-mturk-hits-threads.2/?order=post_date&direction=desc`, {
      credentials: `include`
    })
    const dailyThreadsDOM = new window.DOMParser().parseFromString(await dailyThreads.text(), `text/html`)

    const xfToken = dailyThreadsDOM.getElementsByName(`_xfToken`)

    if (xfToken.length > 0 && xfToken[0].value.length > 0) {
      const newestThread = Math.max(...[...dailyThreadsDOM.querySelectorAll(`li[id^="thread-"]`)].map(element => Number(element.id.replace(/[^0-9.]/g, ``))))

      const checkPosts = await window.fetch(`https://turkerhub.com/hub.php?action=getPosts&thread_id=${newestThread}&order_by=post_date`, {
        credentials: `include`
      })

      const hit = request.data.hit
      const json = await checkPosts.json()

      for (const post of json.posts) {
        if (post.message.indexOf(hit.hit_set_id) !== -1) {
          throw `HIT was recently posted`
        }
      }

      const postHIT = await window.fetch(`https://turkerhub.com/threads/${newestThread}/add-reply`, {
        method: `post`,
        body: new window.URLSearchParams(`_xfToken=${xfToken[0].value}&message_html=${await messageHtml(hit)}`),
        credentials: `include`
      })

      if (postHIT.status === 200) {
        const notification = new window.Notification(`HIT Export Successful!`, {
          icon: `/media/icon_128.png`,
          body: `Turker Hub export posted on TurkerHub.com`
        })

        setTimeout(notification.close.bind(notification), 10000)
      } else {
        throw `Export post status ${postHIT.status}`
      }
    }
  } catch (error) {
    new window.Notification(`HIT Export Failed!`, {
      icon: `/media/icon_128.png`,
      body: `Turker Hub export failed with the error ${error}`
    })
  }
}

async function hitExportMTurkCrowd (args, request, sender, sendResponse) {
  async function messageHtml (hit) {
    const template = []

    function ratingColor (rating) {
      return rating

      /*
      if (rating > 3.99) {
        return `[color=#00cc00]${rating}[/color]`
      } else if (rating > 2.99) {
        return `[color=#cccc00]${rating}[/color]`
      } else if (rating > 1.99) {
        return `[color=#cc6600]${rating}[/color]`
      } else if (rating > 0.00) {
        return `[color=#cc0000]${rating}[/color]`
      }
      return rating
      */
    }

    function percentColor (rating) {
      if (rating[1] > 0) {
        const percent = Math.round(rating[0] / rating[1] * 100)

        return `${percent}% of ${rating[1]}`

        /*
        if (percent > 79) {
          return `[color=#00cc00]${percent}%[/color] of ${rating[1]}`
        } else if (percent > 59) {
          return `[color=#cccc00]${percent}%[/color] of ${rating[1]}`
        } else if (percent > 39) {
          return `[color=#cc6600]${percent}%[/color] of ${rating[1]}`
        }
        return `[color=#cc0000]${percent}%[/color] of ${rating[1]}`
        */
      }
      return `---`
    }

    function goodBadColor (rating) {
      return rating
      // return `[color=${rating === 0 ? `#00cc00` : `#cc0000`}]${rating}[/color]`
    }

    const review = await requesterReviewsGetExport(hit.requester_id)

    if (storage.scripts.requesterReviews === true) {
      if (storage.reviews.turkerview === true) {
        const tv = review.turkerview

        if (tv instanceof Object) {
          template.push([
            `[b][url=https://turkerview.com/requesters/${hit.requester_id}]TV[/url]:`,
            `[Hrly: $${tv.ratings.hourly}]`,
            `[Pay: ${ratingColor(tv.ratings.pay)}]`,
            `[Fast: ${ratingColor(tv.ratings.fast)}]`,
            `[Comm: ${ratingColor(tv.ratings.comm)}]`,
            `[Rej: ${goodBadColor(tv.rejections)}]`,
            `[ToS: ${goodBadColor(tv.tos)}]`,
            `[Blk: ${goodBadColor(tv.blocks)}][/b]`
          ].join(` `))
        } else {
          template.push(`[b][url=https://turkerview.com/requesters/${hit.requester_id}]TV[/url]:[/b] No Reviews`)
        }
      }

      if (storage.reviews.turkopticon === true) {
        const to = review.turkopticon

        if (to instanceof Object) {
          const toAttrs = to.attrs

          template.push([
            `[b][url=https://turkopticon.ucsd.edu/${hit.requester_id}]TO[/url]:`,
            `[Pay: ${ratingColor(toAttrs.pay)}]`,
            `[Fast: ${ratingColor(toAttrs.fast)}]`,
            `[Comm: ${ratingColor(toAttrs.comm)}]`,
            `[Fair: ${ratingColor(toAttrs.fair)}]`,
            `[Reviews: ${to.reviews}]`,
            `[ToS: ${goodBadColor(to.tos_flags)}][/b]`
          ].join(` `))
        } else {
          template.push(`[b][url=https://turkopticon.ucsd.edu/${hit.requester_id}]TO[/url]:[/b] No Reviews`)
        }
      }

      if (storage.reviews.turkopticon2 === true) {
        const to2 = review.turkopticon2

        if (to2 instanceof Object) {
          const to2Recent = to2.recent

          template.push([
            `[b][url=https://turkopticon.info/requesters/${hit.requester_id}]TO2[/url]:`,
            `[Hrly: ${to2Recent.reward[1] > 0 ? `${(to2Recent.reward[0] / to2Recent.reward[1] * 3600).toMoneyString()}` : `---`}]`,
            `[Pen: ${to2Recent.pending > 0 ? `${(to2Recent.pending / 86400).toFixed(2)} days` : `---`}]`,
            `[Res: ${percentColor(to2Recent.comm)}]`,
            `[Rec: ${percentColor(to2Recent.recommend)}]`,
            `[Rej: ${goodBadColor(to2Recent.rejected[0])}]`,
            `[ToS: ${goodBadColor(to2Recent.tos[0])}]`,
            `[Brk: ${goodBadColor(to2Recent.broken[0])}][/b]`
          ].join(` `))
        } else {
          template.push(`[b][url=https://turkopticon.info/requesters/${hit.requester_id}]TO2[/url]:[/b] No Reviews`)
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
      `[tr][td][center][size=2]HIT exported from [url=http://mturksuite.com/]Mturk Suite[/url] v${chrome.runtime.getManifest().version}[/size][/center][/td][/tr][/table]`

    ].filter((item) => item !== undefined && item !== ``).map((currentValue) => `<p>${currentValue}</p>`).join(``)

    return exportTemplate
  }

  try {
    const dailyThreads = await window.fetch(`https://www.mturkcrowd.com/forums/4/?order=post_date&direction=desc`, {
      credentials: `include`
    })
    const dailyThreadsDOM = new window.DOMParser().parseFromString(await dailyThreads.text(), `text/html`)

    const xfToken = dailyThreadsDOM.getElementsByName(`_xfToken`)

    if (xfToken.length > 0 && xfToken[0].value.length > 0) {
      const newestThread = Math.max(...[...dailyThreadsDOM.querySelectorAll(`li[id^="thread-"]`)].map(element => Number(element.id.replace(/[^0-9.]/g, ``))))

      const checkPosts = await window.fetch(`https://www.mturkcrowd.com/api.php?action=getPosts&thread_id=${newestThread}&order_by=post_date`, {
        credentials: `include`
      })

      const hit = args.hit
      const json = await checkPosts.json()

      for (const post of json.posts) {
        if (post.message.indexOf(hit.hit_set_id) !== -1) {
          throw `HIT was recently posted`
        }
      }

      const postHIT = await window.fetch(`https://www.mturkcrowd.com/threads/${newestThread}/add-reply`, {
        method: `post`,
        body: new window.URLSearchParams(`_xfToken=${xfToken[0].value}&message_html=${await messageHtml(hit)}`),
        credentials: `include`
      })

      if (postHIT.status === 200) {
        const notification = new window.Notification(`HIT Export Successful!`, {
          icon: `/media/icon_128.png`,
          body: `MTurk Crowd export posted on MTurkCrowd.com`
        })

        setTimeout(notification.close.bind(notification), 10000)
      } else {
        throw `Export post status ${postHIT.status}`
      }
    }
  } catch (error) {
    new window.Notification(`HIT Export Failed!`, {
      icon: `/media/icon_128.png`,
      body: `MTurk Crowd export failed with the error ${error}`
    })
  }
}

// Copies the provided string to the users clipboard.
function copyTextToClipboard (string) {
  const textarea = document.createElement(`textarea`)
  textarea.textContent = string
  document.body.appendChild(textarea)

  textarea.select()
  document.execCommand(`copy`)

  document.body.removeChild(textarea)
}

// Listens for incoming messages.
chrome.runtime.onMessage.addListener(hitExporterListener)
