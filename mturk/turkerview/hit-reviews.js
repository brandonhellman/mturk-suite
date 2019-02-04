function taskHourlyTVClass(hourly) {
    if (hourly == null) return `unrated`;
  
    if (hourly > 10.50) return `mts-green`;
    if (hourly > 7.25) return `mts-orange`;
    if (hourly > 0.0) return `mts-red`;
    return `unrated`;
  }

function returnHitDetailDataModal(json){
    return `
<div id="taskReviewDataModal" class="modal fade in" tabindex="-1" role="dialog" style="margin-top: 2rem; display: none;">
   <div id="taskReviewDataDialog" class="modal-dialog" role="document">
      <div class="modal-content">
         <div class="modal-header">
            <button id="taskReviewDataCloseButton" type="button" class="close" data-dismiss="modal" aria-label="Close">
               <svg class="close-icon" viewBox="0 0 9.9 10.1">
                  <g fill="none" stroke="#555" class="close-icon-graphic" stroke-width="2.117" stroke-linecap="round">
                     <path d="M1.2 1.3l7.4 7.5M1.2 8.8l7.4-7.5"></path>
                  </g>
               </svg>
            </button>
            <h2 class="modal-title">TurkerView HIT Details (${json.total_reviews})</h2>
         </div>
         <div class="modal-body project-details no-footer">
         <div class="alert alert-warning" style="font-size: 0.857rem; display: ${userApiKey.length == 40 ? `none` : `block`}">
            <h3>You need a valid TurkerView Auth Key</h3>
            <p>Please <a href="https://turkerview.com/account/api" target="_blank">register & claim your <strong>free</strong> API Key</a> by Feb 7th.</p>
        </div>
            <div class="row" style="text-align: center;">
               <div class="col-xs-12">
                  <h3>Overall Average Hourly</h3>
                  <h2 class="text-${json.avg_class}">$${(Number(json.avg_hourly)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
                  <h3>${moment.utc(json.avg_comp*1000).format('HH:mm:ss')}</h3>
               </div>
            </div>
            
            <div class="row" style="text-align: center;">
               <div class="col-xs-6">
                  <h3>Minimum Hourly</h3>
                  <span class="text-${json.min_class}"><i class="fa fa-caret-down text-danger"></i> $${(Number(json.min_hourly)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
               </div>
               <div class="col-xs-6">
                  <h3>Maximum Hourly</h3>
                  <span class="text-${json.max_class}"><i class="fa fa-caret-up text-success"></i> $${(Number(json.max_hourly)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
               </div>
            </div>
            
            <div class="row" style="text-align: center;">
                <h3 class="text-warning">Times are grouped by worker's speed across a variety of tasks and they may not be in order of speed on <em>this</em> particular HIT.</h3>
               <div class="col-xs-1"></div>
               <div class="col-xs-2">
                  <h3>Careful</h3>
                  <span class="text-${json.user_splits.careful.class}">$${(Number(json.user_splits.careful.hourly)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}<small class="text-muted">/hr</small></span>
                  <h3>${moment.utc(json.user_splits.careful.time*1000).format('HH:mm:ss')}</h3>
                  <h3 style="display: ${json.user_group == 1 ? `block` : `none`}"><i class="fa fa-arrow-up"></i></h3>
               </div>
               <div class="col-xs-2">
                  <h3>Relaxed</h3>
                  <span class="text-${json.user_splits.relaxed.class}">$${(Number(json.user_splits.relaxed.hourly)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}<small class="text-muted">/hr</small></span>
                  <h3>${moment.utc(json.user_splits.relaxed.time*1000).format('HH:mm:ss')}</h3>
                  <h3 style="display: ${json.user_group == 2 ? `block` : `none`}"><i class="fa fa-arrow-up"></i></h3>
               </div>
               <div class="col-xs-2">
                  <h3>Average</h3>
                  <span class="text-${json.user_splits.average.class}">$${(Number(json.user_splits.average.hourly)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}<small class="text-muted">/hr</small></span>
                  <h3>${moment.utc(json.user_splits.average.time*1000).format('HH:mm:ss')}</h3>
                  <h3 style="display: ${json.user_group == 3 ? `block` : `none`}"><i class="fa fa-arrow-up"></i></h3>
               </div>
               <div class="col-xs-2">
                  <h3>Fast</h3>
                  <span class="text-${json.user_splits.fast.class}">$${(Number(json.user_splits.fast.hourly)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}<small class="text-muted">/hr</small></span>
                  <h3>${moment.utc(json.user_splits.fast.time*1000).format('HH:mm:ss')}</h3>
                  <h3 style="display: ${json.user_group == 4 ? `block` : `none`}"><i class="fa fa-arrow-up"></i></h3>
               </div>
               <div class="col-xs-2">
                  <h3>Proficient</h3>
                  <span class="text-${json.user_splits.proficient.class}">$${(Number(json.user_splits.proficient.hourly)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}<small class="text-muted">/hr</small></span>
                  <h3>${moment.utc(json.user_splits.proficient.time*1000).format('HH:mm:ss')}</h3>
                  <h3 style="display: ${json.user_group == 5 ? `block` : `none`}"><i class="fa fa-arrow-up"></i></h3>
               </div>
               <div class="col-xs-1"></div>
               <div class="col-xs-12" style="display: ${json.user_group == 0 ? `block` : `none`}"><h3 class="text-warning">You don't have enough reviews to display a work group! Consider leaving reviews in order to enable grouping.</h3></div>
            </div>
            <div class="row">
                <div class="col-xs-12">
                <h2>Work Groups</h2>
                <ul class="text-muted">
                    <li><h3 class="text-muted">Careful - Careful readers tend to take their time, about an average worker with less than 5,000 HITs completed</h3></li>
                    <li><h3 class="text-muted">Relaxed - these workers most often move at a pace you'd expect for someone who has completed 5,000-10,000 HITs</h3></li>
                    <li><h3 class="text-muted">Average - these are workers who tend to stay close to the average / middle of the pack of workers on TV.</h3></li>
                    <li><h3 class="text-muted">Fast - Workers who have completed thousands of tasks & likely use faster computers with organized workflows</h3></li>
                    <li><h3 class="text-muted">Proficient - These workers tend to have tens of thousands of HITs under their belt along with special scripts & keybinds to complete work faster.</h3></li>
                </ul>
                    <h3 class="text-muted"><i class="fa fa-arrow-up"></i> - Your group (users you're most likely to have a completion time close to) - you'll need to leave 50+ reviews before this starts becoming reliable</h3>
                </div>
            </div>
            
            <div class="row m-t-lg m-b-0" style="text-align: center;">
               <div class="col-xs-6"><a href="https://turkerview.com/requesters/${json.requester_id}" target="_blank">Overview</a></div>
               <div class="col-xs-6"><a href="https://turkerview.com/requesters/${json.requester_id}/reviews" target="_blank">Reviews</a></div>
            </div>
         </div>
      </div>
   </div>
</div>
<div id="taskReviewDataBackdrop" class="modal-backdrop fade in" style="display: none;"></div>
    `;
}

function buildAndAppend(json, assignableHitsCount){
    if (json.avg_hourly === null) return;

    document.querySelector(`body`).insertAdjacentHTML(`beforeend`, returnHitDetailDataModal(json));

    let file = taskHourlyTVClass(json.avg_hourly);

    document.querySelectorAll(`.work-pipeline-action`).forEach(el => {
        el.insertAdjacentHTML(`afterbegin`, `<a class="btn btn-secondary tv-task-review-data" href="#" style="margin-right: 5px;"><img src="https://turkerview.com/assets/images/tv-${file}.png" style="max-height: 14px;"></img></a>`);
    })

    document.querySelectorAll(`.task-project-title`).forEach(el => {
        el.insertAdjacentHTML(`afterbegin`, `<div class="tv-task-review-data" style="display: inline-block; margin-right: 4px; cursor: pointer;"><img src="https://turkerview.com/assets/images/tv-${file}.png" style="max-height: 16px;"></img></div>`);
    })

    document.getElementById(`taskReviewDataModal`).addEventListener(`click`, function(){
        hideTaskReviewData()
    })

    document.getElementById(`taskReviewDataCloseButton`).addEventListener(`click`, function(){
        hideTaskReviewData()
    })

    document.querySelectorAll(`.tv-task-review-data`).forEach(el => {
        el.addEventListener(`click`, function(){
            showTaskReviewData();
        })
    })

    document.getElementById(`taskReviewDataDialog`).addEventListener(`click`, function(e){
        e.stopPropagation();
    });
}

function showTaskReviewData(){
    document.getElementById(`taskReviewDataModal`).style.display = `block`;
    document.getElementById(`taskReviewDataBackdrop`).style.display = `block`;    
    document.querySelector(`body`).classList.add(`global-modal-open`);
    document.querySelector(`body`).classList.add(`modal-open`);
}

function hideTaskReviewData(){
    document.getElementById(`taskReviewDataModal`).style.display = `none`;
    document.getElementById(`taskReviewDataBackdrop`).style.display = `none`;
    document.querySelector(`body`).classList.remove(`global-modal-open`);
    document.querySelector(`body`).classList.remove(`modal-open`);
}

function getDetailedHitData(requester_id, reward, title, assignableHitsCount, hit_set_id){
    const postData = {
        requester_id: requester_id,
        reward: reward,
        title: title
    };

    /* Check for cached data first */
    let found_in_storage = false;

    Object.keys(localStorage)
        .forEach(function(key){
            if (/^tv-hit-review/.test(key)) {
                let json = JSON.parse(localStorage.getItem(key));
                let now = moment.tz('America/Los_Angeles');
                let difference_ms = moment(now).diff(moment(json['date']));
                if (difference_ms > 450000){
                    localStorage.removeItem(key); // delete after 7 minutes
                    return;
                }
                if (json['hit_set_id'] != hit_set_id) return;

                found_in_storage = true;

                buildAndAppend(json);
            }
        });

    if (found_in_storage) return;

    /* Nothing in cache we should just call TV's API */
    fetch('https://view.turkerview.com/v1/hits/hit/', {
        method: 'POST',
        headers: taskViewHeaders,
        body: JSON.stringify(postData)
    }).then(response => {
        if (!response.ok) throw response;

        return response.json();
    }).then(json => {
        buildAndAppend(json, assignableHitsCount);

        if (assignableHitsCount > 10){
            json['date'] = moment.tz('America/Los_Angeles');
            json['hit_set_id'] = hit_set_id;
            localStorage.setItem('tv-hit-review-'+hit_set_id, JSON.stringify(json));
        }

    }).catch(ex => {
        console.log(ex);
    });

}

async function initHitReview(){
    const [dom, props] = await Promise.all([
        ReactDOM(`ShowModal`),
        ReactProps(`ShowModal`)
    ]);

    let hit_set_id = document.querySelectorAll('form[action*="projects/')[0].action.match(/projects\/([A-Z0-9]+)\/tasks/)[1];
    let requester_id = props.modalOptions.contactRequesterUrl.match(/requester_id%5D=([A-Z0-9]+)&/)[1];
    let assignable_hits_count = props.modalOptions.assignableHitsCount;
    let title = props.modalOptions.projectTitle;
    let reward = props.modalOptions.monetaryReward.amountInDollars;

    getDetailedHitData(requester_id, reward, title, assignable_hits_count, hit_set_id);
}

let taskuserApiKey;
let taskViewHeaders;

function buildHeaders(userApiKey){
    taskViewHeaders = new Headers([
        [`X-VIEW-KEY`, taskuserApiKey],
        [`X-APP-KEY`, `MTurk Suite`],
        [`X-APP-VER`, chrome.runtime.getManifest().version] //SemVer
    ]);
}

chrome.storage.local.get([`options`], keys => {
    taskuserApiKey = keys.options.turkerviewApiKey || ``;
    buildHeaders(taskuserApiKey);
    if (!keys.options.turkerview) return;
    initHitReview();
})
