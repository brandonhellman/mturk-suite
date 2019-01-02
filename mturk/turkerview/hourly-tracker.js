moment.tz.add("America/Los_Angeles|PST PDT PWT PPT|80 70 70 70|010102301010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-261q0 1nX0 11B0 1nX0 SgN0 8x10 iy0 5Wp1 1VaX 3dA0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1a00 1fA0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 s10 1Vz0 LB0 1BX0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|15e6");

let workDurationInMs = 0;
let workDurationPause = false;
let workPauseDurationInMs = 0;
let workPauseMoment;
let workStartMoment = moment.tz(`America/Los_Angeles`);
let hourlyTracker;
let showElapsed = true;

function hourlyWageClass(wage) {
    if (wage > 10.50) return `text-success`;
    if (wage > 7.25) return `text-warning`;
    if (wage > 0.0) return `text-danger`;
    return `text-muted`;
}

function timerString(durationInSeconds, format){
    return moment.duration(durationInSeconds, "seconds").format(format);
}

function workDuration(){
    let tempPauseDuration = 0;
    if (workDurationPause)  tempPauseDuration = workDurationInMs + (moment(moment.tz(`America/Los_Angeles`)).diff(workPauseMoment));
    let currentWorkInterval = moment(moment.tz(`America/Los_Angeles`)).diff(moment(workStartMoment));
    let adjustedWorkDuration = (currentWorkInterval-(workPauseDurationInMs+tempPauseDuration))/1000

    return adjustedWorkDuration;
}

(async function(){
    const [dom, props, taskprops] = await Promise.all([
        ReactDOM(`CompletionTimer`),
        ReactProps(`CompletionTimer`),
        ReactProps(`ShowModal`)
    ]);

    const oldDurationElement = dom.parentElement.parentElement;
    const durationTotal = props.originalTimeToCompleteInSeconds;
    let durationRemaining = props.timeRemainingInSeconds;

    const taskReward = taskprops.modalOptions.monetaryReward.amountInDollars;

    const trackerHTML = /*html*/`
    <div class="col-xs-4">
        <span id="mtsHourlyContainer" class="detail-bar-label" style="cursor: pointer;" title="This will pause the timer for your hourly wage, use this when taking a break or otherwise not working on the HIT." data-toggle="tooltip" data-placement="bottom">
            <span id="mtsHourlyWage"></span>
            <span id="mtsWorkTime"></span>
            <span id="mtsDurationTracker" style="margin-right: 5px;">00:00 [E]</span>
        </span>
        <span id="swapTimeDisplay" class="detail-bar-label" style="padding-left: 5px; cursor: pointer;"><i class="fa fa-exchange"></i></span>
    </div>`;

    oldDurationElement.insertAdjacentHTML(`beforebegin`, trackerHTML);
    oldDurationElement.style.display = `none`;

    document.getElementById(`swapTimeDisplay`).addEventListener(`click`, function() { 
        showElapsed = showElapsed ? false : true;
        document.getElementById(`mtsHourlyWage`).style.display = showElapsed ? `inherit` : `none`;
        document.getElementById(`mtsDurationTracker`).innerHTML = showElapsed ? `${timerString(workDuration(), "*mm:ss")} [E]` : `${timerString(durationRemaining, "H:*mm:ss")} [R] / ${timerString(durationTotal, "H:*mm:ss")} [T]`;
    });

    document.getElementById(`mtsHourlyContainer`).addEventListener(`click`, function(){
        if (!workDurationPause){
            workDurationPause = true;

            workPauseMoment = moment.tz(`America/Los_Angeles`);
            let workDurationInSeconds = workDuration();

            if (taskReward > 0){
                let currentWage = (3600/workDurationInSeconds)*taskReward;
                let displayWage = currentWage.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                document.getElementById(`mtsHourlyWage`).innerHTML = `<span class="${hourlyWageClass(currentWage)}">$${displayWage}/hr`;
            }

            document.getElementById(`mtsHourlyWage`).style.display = showElapsed ? `inherit` : `none`;
            document.getElementById(`mtsDurationTracker`).innerHTML = showElapsed ? `${timerString(workDurationInSeconds, "*mm:ss")} [E]` : `${timerString(durationRemaining, "H:*mm:ss")} [R] / ${timerString(durationTotal, "H:*mm:ss")} [T]`;

        } else{
            workDurationPause = false;
            workPauseDurationInMs += moment(moment.tz(`America/Los_Angeles`)).diff(workPauseMoment);

            document.getElementById(`mtsHourlyWage`).style.display = showElapsed ? `inherit` : `none`;
            document.getElementById(`mtsDurationTracker`).innerHTML = showElapsed ? `${timerString(workDuration(), "*mm:ss")} [E]` : `${timerString(durationRemaining, "H:*mm:ss")} [R] / ${timerString(durationTotal, "H:*mm:ss")} [T]`;
        }
    });

    hourlyTracker = setInterval(updateDisplay, 1000);

    function updateDisplay(){
        durationRemaining--;
        let workDurationInSeconds = workDuration();

        document.getElementById(`mtsHourlyWage`).style.display = showElapsed ? `inherit` : `none`;
        document.getElementById(`mtsDurationTracker`).innerHTML = showElapsed ? `${timerString(workDurationInSeconds, "*mm:ss")} [E]` : `${timerString(durationRemaining, "H:*mm:ss")} [R] / ${timerString(durationTotal, "H:*mm:ss")} [T]`;

        if (workDurationPause) return;

        if (taskReward > 0){
            let currentWage = (3600/workDurationInSeconds)*taskReward;
            let displayWage = currentWage.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
            document.getElementById(`mtsHourlyWage`).innerHTML = `<span class="${hourlyWageClass(currentWage)}">$${displayWage}/hr`;

            if (currentWage < 7.25 && !document.getElementById(`mtsReturnReviewFromHourlyTrackerAlert`)){
                document.getElementById(`swapTimeDisplay`).insertAdjacentHTML(`afterend`, `<span id="hourlyTvReturnReview"><br><a id="mtsReturnReviewFromHourlyTrackerAlert" class="text-warning detail-bar-label mts-tv-return-warn" style="margin-right: 5px; cursor: pointer;">[ Review & Return ]</a></span>`)
                console.log('el' + document.getElementById(`mtsReturnReviewFromHourlyTrackerAlert`));
                document.getElementById(`mtsReturnReviewFromHourlyTrackerAlert`).addEventListener(`click`, function(){
                    document.querySelector(`body`).classList.add(`global-modal-open`);
                    document.querySelector(`body`).classList.add(`modal-open`);
                    document.getElementById(`mts-tvReturnModal`).style.display = `block`;
                    document.getElementById(`mts-tv-return-modal-backdrop`).style.display = `block`;
        
                    document.querySelector(`input[name=elapsed_work_time]`).value = workDuration();
                });
            }
        }
        
    }

})();