/* globals chrome storage mturkReact scriptEnabled */

(async function () {
  const enabled = await scriptEnabled(`requesterReviews`)
  if (!enabled) return

  const react = await mturkReact(`reactComponents/hitSetTable/HitSetTable`) || await mturkReact(`reactComponents/taskQueueTable/TaskQueueTable`) || await mturkReact(`reactComponents/hitStatusDetailsTable/HitStatusDetailsTable`)
  const reactProps = await react.getProps()

  const requesters = [...new Set(reactProps.bodyData.map((currentValue) => currentValue.project ? currentValue.project.requester_id : currentValue.requester_id))]

  const requesterReviews = await new Promise((resolve) => chrome.runtime.sendMessage({
    function: `requesterReviewsGet`,
    arguments: {
      requesters: requesters
    }
  }, resolve))

  const reactElement = await react.getElement()
  const hitRows = reactElement.getElementsByClassName(`table-row`)

  for (let i = 0; i < hitRows.length; i++) {
    const hit = reactProps.bodyData[i].project ? reactProps.bodyData[i].project : reactProps.bodyData[i]

    const review = requesterReviews[hit.requester_id]

    const turkerview = ((object) => {
      let template = ``

      if (storage.reviews.turkerview === true) {
        if (object instanceof Object) {
          template = buildColumns([
                        [`Hourly`, object.ratings.hourly],
                        [`Pay`, object.ratings.pay],
                        [`Fast`, object.ratings.fast],
                        [`Comm`, object.ratings.comm],
                        [`Rej`, object.rejections],
                        [`ToS`, object.tos],
                        [`Blocks`, object.blocks]
          ])
        } else {
          template = `No Reviews`
        }
        return `<div class="col-xs-4" style="width: 150px;"><h2><a class="text-primary" href="https://turkerview.com/requesters/${hit.requester_id}" target="_blank">TurkerView</a></h2>${template}<div><a href="https://turkerview.com/review.php?rname=${encodeURIComponent(hit.requester_name)}&rid=${hit.requester_id}&title=${hit.title}" target="_blank">Review on TV</a></div></div>`
      }
      return ``
    })(review.turkerview)

    const turkopticon = ((object) => {
      let template = ``

      if (storage.reviews.turkopticon === true) {
        if (object instanceof Object) {
          template = buildColumns([
                        [`Pay`, `${object.attrs.pay} / 5`],
                        [`Fast`, `${object.attrs.fast} / 5`],
                        [`Comm`, `${object.attrs.comm} / 5`],
                        [`Fair`, `${object.attrs.fair} / 5`],
                        [`Reviews`, object.reviews],
                        [`ToS`, object.tos_flags]
          ])
        } else {
          template = `No Reviews`
        }
        return `<div class="col-xs-4" style="width: 150px;"><h2><a class="text-primary" href="https://turkopticon.ucsd.edu/${hit.requester_id}" target="_blank">Turkopticon</a></h2>${template}<div class="col-xs-12">&nbsp;</div><div><a href="https://turkopticon.ucsd.edu/report?requester[amzn_id]=${hit.requester_id}&requester[amzn_name]=${encodeURIComponent(hit.requester_name)}" target="_blank">Review on TO</a></div></div>`
      }
      return ``
    })(review.turkopticon)

    const turkopticon2 = ((object) => {
      let template = ``

      if (storage.reviews.turkopticon2 === true) {
        if (object instanceof Object) {
          const all = object.all
          const recent = object.recent
          template = buildColumns([
            [
              `Hourly`,
              recent.reward[1] > 0 ? `$${(recent.reward[0] / recent.reward[1] * 3600).toFixed(2)}` : `---`,
              all.reward[1] > 0 ? `$${(all.reward[0] / all.reward[1] * 3600).toFixed(2)}` : `---`
            ],
                        [`Pending`, object.recent.pending > 0 ? `${(object.recent.pending / 86400).toFixed(2)} days` : `---`],
                        [`Response`, object.recent.comm[1] > 0 ? `${Math.round(object.recent.comm[0] / object.recent.comm[1] * 100)}% of ${object.recent.comm[1]}` : `---`],
                        [`Recommend`, object.recent.recommend[1] > 0 ? `${Math.round(object.recent.recommend[0] / object.recent.recommend[1] * 100)}% of ${object.recent.recommend[1]}` : `---`],
                        [`Rejected`, object.recent.rejected[0]],
                        [`ToS`, object.recent.tos[0]],
                        [`Broken`, object.recent.broken[0]]
          ])
        } else {
          template = `No Reviews`
        }
        return `<div class="col-xs-4" style="width: 225px;"><h2><a class="text-primary" href="https://turkopticon.info/requesters/${hit.requester_id}" target="_blank">Turkopticon 2</a></h2>${template}<div><a href="https://turkopticon.info/reviews/new?name=${encodeURIComponent(hit.requester_name)}&rid=${hit.requester_id}" target="_blank">Review on TO2</a></div></div>`
      }
      return ``
    })(review.turkopticon2)

    for (const el of hitRows[i].getElementsByClassName(`expand-button`)) {
      const button = document.createElement(`button`)
      button.className = `btn btn-sm btn-${requesterReviewGetClass(hit.requester_id)} fa fa-user`
      button.dataset.toggle = `popover`
      button.style.marginRight = `5px`
      button.addEventListener(`click`, (event) => {
        event.target.closest(`.desktop-row`).click()
      })

      const script = document.createElement(`script`)
      script.textContent = `$(document.currentScript).parent().popover({ html: true, trigger: 'hover focus', title: '${hit.requester_name} [${hit.requester_id}]', content: '<div class="container">${turkerview + turkopticon + turkopticon2}</div>' });`
      button.appendChild(script)

      el.parentElement.insertBefore(button, el)
      el.style.display = `none`
    }
  }

  const style = document.createElement(`style`)
  style.innerHTML = `.popover { max-width: 1000px; }`
  document.head.appendChild(style)

  function buildColumns () {
    const [columns] = arguments

    let templateLabels = ``
    let templateValues = ``

    for (const value of columns) {
      templateLabels += `<div>${value[0]}</div>`
      templateValues += `<div>${value[1]}</div>`
    }

    return `<div class="col-xs-6">${templateLabels}</div><div class="col-xs-6">${templateValues}</div>`
  }

  function requesterRatingAverage () {
    const [requesterId] = arguments

    const review = requesterReviews[requesterId]

    if (review) {
      const tv = storage.reviews.turkerview ? review.turkerview : null
      const to = storage.reviews.turkopticon ? review.turkopticon : null
      const to2 = storage.reviews.turkopticon2 ? review.turkopticon2 : null

      const tvPay = tv ? tv.ratings.pay : null
      const tvHrly = tv ? (tv.ratings.hourly / 3) : null
      const toPay = to ? to.attrs.pay : null
      const to2Hrly = to2 ? to2.recent.reward[1] > 0 ? ((to2.recent.reward[0] / to2.recent.reward[1] * 3600) / 3) : to2.all.reward[1] > 0 ? ((to2.all.reward[0] / to2.all.reward[1] * 3600) / 3) : null : null

      if (tvPay || tvHrly || toPay || to2Hrly) {
        const average = [tvPay, tvHrly, toPay, to2Hrly].filter(Boolean).map((currentValue, index, array) => Number(currentValue) / array.length).reduce((a, b) => a + b)
        return average
      }
    }

    return 0
  }

  function requesterReviewGetClass () {
    const [requesterId] = arguments

    const average = requesterRatingAverage(requesterId)
    return (average > 3.75 ? `success` : average > 2 ? `warning` : average > 0 ? `danger` : `default`)
  }
})()
