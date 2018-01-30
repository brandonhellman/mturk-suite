/* globals chrome mturkReact scriptEnabled */

(async function () {
  const enabled = await scriptEnabled(`hitTracker`)
  if (!enabled) return

  const react = await mturkReact(`reactComponents/common/ShowModal`)
  const reactProps = await react.getProps()
  const hitId = await mturkReact(`reactComponents/workPipeline/TaskSubmitter`)
  const hitIdProps = await hitId.getProps()
  const timer = await mturkReact(`reactComponents/common/CompletionTimer`)
  const timerProps = await timer.getProps()

  const assignmentId = new window.URLSearchParams(window.location.search).get(`assignment_id`)

  if (typeof assignmentId === `string`) {
    const mturkDate = ((number) => {
      function dst () {
        const today = new Date()
        const year = today.getFullYear()
        let start = new Date(`March 14, ${year} 02:00:00`)
        let end = new Date(`November 07, ${year} 02:00:00`)
        let day = start.getDay()
        start.setDate(14 - day)
        day = end.getDay()
        end.setDate(7 - day)
        return !!((today >= start && today < end))
      }

      const accepted = new Date(Date.now() - (number * 1000))
      const utc = accepted.getTime() + (accepted.getTimezoneOffset() * 60000)
      const offset = dst() === true ? `-7` : `-8`
      const amz = new Date(utc + (3600000 * offset))
      const day = (amz.getDate()) < 10 ? `0` + (amz.getDate()).toString() : (amz.getDate()).toString()
      const month = (amz.getMonth() + 1) < 10 ? `0` + (amz.getMonth() + 1).toString() : (amz.getMonth() + 1).toString()
      const year = (amz.getFullYear()).toString()
      const date = year + month + day

      return date
    })(timerProps.originalTimeToCompleteInSeconds - timerProps.timeRemainingInSeconds)

    const message = {
      function: `hitTrackerUpdate`,
      arguments: {
        hit: {
          hit_id: hitIdProps.hiddenFormParams.task_id,
          requester_id: new window.URLSearchParams(reactProps.modalOptions.contactRequesterUrl).get(`hit_type_message[requester_id]`),
          requester_name: reactProps.modalOptions.requesterName,
          reward: {
            amount_in_dollars: reactProps.modalOptions.monetaryReward.amountInDollars,
            currency_code: reactProps.modalOptions.monetaryReward.currencyCode
          },
          state: `Assigned`,
          title: reactProps.modalOptions.projectTitle,

          date: mturkDate
        },
        assignment_id: assignmentId
      }
    }

    const source = document.querySelector(`iframe.embed-responsive-item`)

    if (source) {
      message.arguments.hit.source = source.src
    }

    chrome.runtime.sendMessage(message)

    document.addEventListener(`submit`, (event) => {
      const returning = event.target.querySelector(`[value="delete"]`)

      if (returning) {
        message.arguments.hit.state = `Returned`

        chrome.runtime.sendMessage(message)
      }
    })

    window.addEventListener(`message`, (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.answer !== undefined && data.assignmentId !== undefined) {
          chrome.runtime.sendMessage({
            function: `hitTrackerSubmitted`,
            arguments: {
              data: data
            }
          })
        }
      } catch (error) { /* empty catch */ }
    })
  }
})()
