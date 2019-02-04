moment.tz.add("America/Los_Angeles|PST PDT PWT PPT|80 70 70 70|010102301010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-261q0 1nX0 11B0 1nX0 SgN0 8x10 iy0 5Wp1 1VaX 3dA0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1a00 1fA0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 s10 1Vz0 LB0 1BX0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|15e6");

function closeReturnReviewDataModal(){
    document.getElementById(`mts-tv-return-warning-data-modal-backdrop`).style.display = `none`;
    document.getElementById(`mts-tvReturnWarningDataModal`).style.display = `none`;
    document.querySelector(`body`).classList.remove(`global-modal-open`)
    document.querySelector(`body`).classList.remove(`modal-open`)
}

function retrieveReturnReviews(hit_set_id, assignable_hits_count){
    let found_in_storage = false;
    let deadline_bool = false;

    /* After Feb 7th we need to make sure the user has an API key or the response will be invalid, faster to do it here. */
    let today = moment.tz('America_Los_Angeles');
    let deadline = moment('2019-02-30').tz('America/Los_Angeles', true);
    let diff = moment(deadline).diff(today, 'days');
    if (diff < 0) deadline_bool = true;
    

    Object.keys(localStorage)
        .forEach(function(key){
            if (/^tv-return-data/.test(key)) {
                let json = JSON.parse(localStorage.getItem(key));
                let now = moment.tz('America/Los_Angeles');
                let difference_ms = moment(now).diff(moment(json['date']));
                if (difference_ms > 450000){
                    localStorage.removeItem(key); // delete after 7 minutes
                    return;
                }
                if (json['group_id'] != hit_set_id) return;

                found_in_storage = true;

                buildReturnWarnings(json);
            }
        });

    if (found_in_storage) return;

    fetch(`https://view.turkerview.com/v2/returns/retrieve/?hit_set_id=${hit_set_id}`, {
        method: 'GET',
        cache: 'no-cache',
        headers: ViewHeaders
    }).then(response => {
        if (!response.ok) throw response;

        return response.json();
    }).then(data => {
        console.log(data);
        console.log(data.length);
        console.log(data.reviews.length);
        if (data.reviews.length === 0) return;
        let reward = 0;
        let total_time_in_ms = 0;
        let underpaid_total = 0;
        let broken_total = 0;
        let unpaid_screener_total = 0;
        let screened_time_total = 0;
        let tos_total = 0;
        let writing_total = 0;
        let downloads_total = 0;
        let em_total = 0;
        let comments = [];
        
        for (i = 0; i < data.reviews.length; i++){
            //let localUserIgnore = JSON.parse(localStorage.getItem('tv-return-ignore-list')) || [];
            //if (localUserIgnore.includes(data[i].user_id)) continue;

            reward = data.reviews[i].reward;
            total_time_in_ms += data.reviews[i].elapsed_work_time;
            underpaid_total += data.reviews[i].underpaid;
            broken_total += data.reviews[i].broken;
            unpaid_screener_total += data.reviews[i].unpaid_screener;
            tos_total += data.reviews[i].tos;
            writing_total += data.reviews[i].writing;
            downloads_total += data.reviews[i].downloads;
            em_total += data.reviews[i].extraordinary_measures;

            let comment_prefix = '';
            if (data.reviews[i].underpaid == 1){
                let hourly = (3600/(data.reviews[i].elapsed_work_time/1000))*(parseFloat(reward)).toFixed(2);
                comment_prefix = `[Marked Underpaid @ $${hourly.toFixed(2)}/hr]<br>`;
            }

            if (data.reviews[i].unpaid_screener == 1){
                screened_time_total += data.reviews[i].elapsed_work_time;

                let time_in_seconds = data.reviews[i].elapsed_work_time/1000;
                let min = Math.floor(time_in_seconds/60);
                let sec = (time_in_seconds%60).toFixed(0);
                comment_prefix += `[Screened out @${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}]<br>`;
            }

            if (data.reviews[i].tos == 1) comment_prefix += `${tosMap.get(data.reviews[i].tos_type)}<br>`;
            if (data.reviews[i].writing == 1) comment_prefix += `${writingMap.get(data.reviews[i].writing_type)}<br>`;
            if (data.reviews[i].downloads == 1) comment_prefix += `${downloadsMap.get(data.reviews[i].downloads_type)}<br>`;
            if (data.reviews[i].extraordinary_measures == 1) comment_prefix += `${emMap.get(data.reviews[i].em_type)}<br>`;

            let comment_object = {
                user_id: data.reviews[i].user_id,
                username: data.reviews[i].username,
                date: data.reviews[i].date,
                tos_type: data.reviews[i].tos_type,
                comment: comment_prefix + data.reviews[i].comment }
            comments.push(comment_object);
            
        }

        let objectToStore = {
            group_id: hit_set_id,
            notice: data.notice,
            date: moment.tz('America/Los_Angeles'),
            reward: reward,
            total_time_in_ms: total_time_in_ms,
            underpaid_total: underpaid_total,
            broken_total: broken_total,
            unpaid_screener_total: unpaid_screener_total,
            unpaid_screener_time: screened_time_total,
            tos_total: tos_total,
            writing_total: writing_total,
            downloads_total: downloads_total,
            em_total: em_total,
            comments: comments
        };

        buildReturnWarnings(objectToStore);

        if (assignable_hits_count >= 10){
            localStorage.setItem('tv-return-data-'+hit_set_id, JSON.stringify(objectToStore));
        }
    }).catch(ex => {
        returnsApiExceptionHandler(ex);
    });
}
const classMap = total_reports => total_reports == 0 ? 'text-muted' :
    total_reports < 3 ? 'text-warning' : 'text-danger';

function buildReturnWarnings(json){
    if (json['broken_total'] + json['underpaid_total'] + json['unpaid_screener_total'] + json['tos_total'] + json['writing_total'] + json['inquisit_total'] == 0) return;

    let highest_warning_class = 'text-danger';
    let x = Number(json['broken_total']) + Number(json['underpaid_total']) + Number(json['unpaid_screener_total']) + Number(json['tos_total']) + Number(json['writing_total']) + Number(json['downloads_total']);

    document.querySelectorAll(`.work-pipeline-action`).forEach(el => {
        el.insertAdjacentHTML(`afterbegin`, `<a ${highest_warning_class == 'hidden' ? 'style="display: none;"' : ''} class="btn btn-danger mts-tv-return-warning-data-launcher" href="#" style="margin-right: 5px;"><i class="fa fa-fw fa-warning"></i> ${x}</a>`);
    })

    document.querySelectorAll(`.task-project-title`).forEach(el => {
        el.insertAdjacentHTML(`afterbegin`, `<div ${highest_warning_class == 'hidden' ? 'style="display: none;"' : 'style="display: inline-block;"'}><i class="fa fa-warning ${highest_warning_class} mts-tv-return-warning-data-launcher" style="cursor: pointer; padding-right: 3px;"> (${x})</i></div>`);
    })

    let btnHtml = `<i class="fa fa-warning fa-fw ${highest_warning_class} mts-tv-return-warning-data-launcher" style="line-height: 1rem; cursor: pointer; ${highest_warning_class == 'hidden' ? 'display: none;' : ''}" data-toggle="tooltip" data-title="Oh shit!"></i>`;

    let brokenClass = classMap(json['broken_total']);
    let underpaidClass = classMap(json['underpaid_total']);
    let screenerClass = classMap(json['unpaid_screener_total']);
    let tosClass = classMap(json['tos_total']);
    let writingClass = classMap(json['writing_total']);
    let downloadsClass = classMap(json['downloads_total'])
    let emClass = classMap(json['em_total']);

    let unpaid_screening_html = `<span class="text-muted">No users have reported being screened out without payment for this HIT.</span>`;
    if (json['unpaid_screener_total'] > 0){
        let average_ms_screened = json['unpaid_screener_time']/json['unpaid_screener_total'];
        let time_in_seconds = average_ms_screened/1000;
        let min_screen = Math.floor(time_in_seconds/60);
        let sec_screen = (time_in_seconds%60).toFixed(0);
        unpaid_screening_html = `<span class="text-warning">${json['unpaid_screener_total'] == 1 ? `1 user has` : `${json['unpaid_screener_total']} users have`} spent an average of <span class="text-danger">${min_screen}m:${sec_screen}s</span> on the screening questions.</span>`;
    }

    let commentHTML = '';
    if (json['comments'].length == 0) commentHTML = `<span class="text-muted">No user comments exist for this HIT</span>`;

    let no_comment_userlist = `<small class="text-muted">Users who did not comment: `;
    for(i = 0; i < json['comments'].length; i++){
        if (json['comments'][i]['comment'] == "") {
            no_comment_userlist += `<a href="https://turkerview.com/users/?user=${json['comments'][i]['user_id']}" target="_blank">${json['comments'][i]['username']}</a>, `;
            continue;
        }
        commentHTML += `
            <p style="margin-bottom: 0;">${moment(json['comments'][i]['date'], 'X').fromNow()} <a href="https://turkerview.com/users/?user=${json['comments'][i]['user_id']}" target="_blank">${json['comments'][i]['username']}</a></small> said: </p>
            <blockquote class="blockquote" style="font-size: .85rem; margin-left: 15px;">${json['comments'][i]['comment']}</blockquote>`;
    }
    no_comment_userlist = no_comment_userlist.slice(0, -2);
    no_comment_userlist += `</small>`;

    let tvReturnWarningDataModal = /* html */`
<div class="modal fade in" id="mts-tvReturnWarningDataModal" style="display: none; z-index: 11000">
    <div id="mts-tv-return-warning-data-dialog" class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button id="mts-tv-return-warning-data-modal-close" type="button" class="close" data-dismiss="modal"><svg class="close-icon" data-reactid=".8.0.0.0.0.0"><g fill="none" stroke="#555" class="close-icon-graphic" stroke-width="2.117" stroke-linecap="round" data-reactid=".8.0.0.0.0.0.0"><path d="M1.2 1.3l7.4 7.5M1.2 8.8l7.4-7.5" data-reactid=".8.0.0.0.0.0.0.0"></path></g></svg></button>
                <h2 class="modal-title">TurkerView Return Warning Report</h2>
            </div>
            <div class="modal-body">
            ${(json['notice'] != null) ? json['notice'] : ``}
            <div class="alert alert-warning" style="font-size: 0.857rem; display: ${userApiKey.length == 40 ? `none` : `block`}">
                <h3>You need a valid TurkerView Auth Key</h3>
                <p>HIT Warnings are a free feature provided by TurkerView. However, they require a valid API Key to retrieve.</p>
                <p>Please <a href="https://turkerview.com/account/api" target="_blank">register & claim your <strong>free</strong> API Key</a> by Feb 7th.</p>
            </div>
                <div class="alert alert-warning" style="${(document.querySelector(`iframe`).src.includes('/evaluation/endor')) ? '' :'display: none;'}">
                    <h4>We're on Endor</h4>
                    <p>This HIT is from a Google Requester (Endor) - they often limit the # of HITs workers can complete which is confusing & gets reported as broken. Generally, they are "safe" to work for so consider checking their full TV profile!</p>
                </div>
                <div id="return-review-warning" class="alert alert-dismissable alert-warning" role="alert" style="display: none;">
                        <button type="button" id="close-return-review-warning" class="close" data-dismiss="alert">×</button>
                        <h4>Heads Up!</h4>
                        <p>While we make every effort to ensure data on TurkerView is accurate & high-quality this feature is new & highly experimental! Make sure to preview comments/user profiles to make sure data is accurate & make a more informed decision :)</p>
                </div>
                <div id="return-ignore-user-failure" class="alert alert-dismissable alert-danger hide">
                        <button type="button" class="close" data-dismiss="alert">×</button>
                        <h4>No Bueno!</h4>
                        <p>You couldn't ignore the user!</p>
                </div>
                <div class="row">
                <h3>Reasons for returning</h3>
                    <div class="row">
                    <div class="col-xs-12 text-muted">
                        <div class="col-xs-3" style="text-align: center;">
                            <h1 class="${brokenClass}" style="margin-bottom: 0;">${json['broken_total']}</h1>
                            <small class="text-muted">Broken Returns</small>
                        </div>
                        <div class="col-xs-3" style="text-align: center;">
                            <h1 class="${underpaidClass}" style="margin-bottom: 0;">${json['underpaid_total']}</h1>
                            <small class="text-muted">Underpaid Returns</small>
                        </div>
                        <div class="col-xs-3" style="text-align: center;">
                            <h1 class="${screenerClass}" style="margin-bottom: 0;">${json['unpaid_screener_total']}</h1>
                            <small class="text-muted">Unpaid Screener Reports</small>
                        </div>
                        <div class="col-xs-3" style="text-align: center;">
                            <h1 class="${tosClass}" style="margin-bottom: 0;">${json['tos_total']}</h1>
                            <small class="text-muted">TOS Violations</small>
                        </div>
                    </div>
                    </div>
                    <div>
                        <div class="col-xs-12 text-muted">
                            <div class="col-xs-4" style="text-align: center;">
                                <h1 class="${writingClass}" style="margin-bottom: 0;">${json['writing_total']}</h1>
                                <small class="text-muted">Writing Returns</small>
                            </div>
                            <div class="col-xs-4" style="text-align: center;">
                                <h1 class="${downloadsClass}" style="margin-bottom: 0;">${json['downloads_total']}</h1>
                                <small class="text-muted">Downloads Warnings</small>
                            </div>
                            <div class="col-xs-4" style="text-align: center;">
                                <h1 class="${emClass}" style="margin-bottom: 0;">${json['em_total']}</h1>
                                <small class="text-muted">Extraordinary Measures Warnings</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                <h3>Unpaid Screening Data</h3>
                    <div class="col-xs-12 text-muted">
                    ${unpaid_screening_html}
                    </div>
                </div>
                <div class="row" style="margin-bottom: 0">
                <h3>User Comments</h3>
                    <div class="col-xs-12 text-muted">
                    ${commentHTML}
                    ${no_comment_userlist}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div id="mts-tv-return-warning-data-modal-backdrop" class="modal-backdrop fade in" style="display: none; z-index: 10999;"></div>`;

    document.querySelector(`footer`).insertAdjacentHTML(`beforebegin`, tvReturnWarningDataModal);

    //modal listeners
    document.getElementById(`mts-tv-return-warning-data-modal-backdrop`).addEventListener(`click`, function(){
        closeReturnReviewDataModal();
    });
    document.getElementById(`mts-tv-return-warning-data-modal-close`).addEventListener(`click`, function(){
        closeReturnReviewDataModal();
    });
    document.getElementById(`mts-tvReturnWarningDataModal`).addEventListener(`click`, function(){
        closeReturnReviewDataModal();
    });

    document.getElementById(`mts-tv-return-warning-data-dialog`).addEventListener(`click`, function(e){
        e.stopPropagation();
    });

    let els = document.getElementsByClassName(`mts-tv-return-warning-data-launcher`);
    Array.prototype.forEach.call(els, function(el){
        el.addEventListener(`click`, function(){
            document.querySelector(`body`).classList.add(`global-modal-open`);
            document.querySelector(`body`).classList.add(`modal-open`);
            document.getElementById(`mts-tvReturnWarningDataModal`).style.display = `block`;
            document.getElementById(`mts-tv-return-warning-data-modal-backdrop`).style.display = `block`;
        })
    });
}

function returnsApiExceptionHandler(exception){
    /*
     Current exceptions that should be handled [code: message]
     401: invalidUserAuthKey - no or incorrect user api key provided, notify user to register and/or check their API key on TurkerView (free for ~2-3hrs of usage/day)
     401: invalidApplicationKey - no or incorrect application identifier provided, please register your application w/ TurkerView (its free)
     403: dailyLimitExceeded - user has run out of free API calls, stop sending requests & notify user to upgrade or wait until tomorrow

     Exception text can be accessed with ex.statusText
     */

    const MainContainer = document.getElementById(`MainContent`);
    if (document.getElementById(`tvjs-view-error`)) return;
    if (exception.statusText == 'invalidUserAuthKey') MainContainer.insertAdjacentHTML(`afterbegin`, `
<div id="tvjs-view-error" class="alert alert-danger">
    <h4>Your TurkerView API Key is invalid.</h4>
    <p>The HIT Warning feature is free! You just need to claim your free API key (or support the site with a subscription!) from your <a href="https://turkerview.com/account/api/" target="_blank">TurkerView account API dashboard.</a></p>
</div>`);
    
}

async function initReturnReviews(){

    const tv_storage_check = localStorage.getItem(`tv-settings`) || null;

    if (tv_storage_check){
        const tv_last_active = moment(JSON.parse(tv_storage_check).last_sync).tz('America/Los_Angeles');
        const diff = moment().tz('America/Los_Angeles').diff(tv_last_active, 'hours')
        // TVJS is still installed on this user's machine (most likely) - don't add a 2nd return review dialog, we'll have TVJS defer to MTS later
        if (diff < 36) return;
    }

    const [dom, props] = await Promise.all([
        ReactDOM(`ShowModal`),
        ReactProps(`ShowModal`)
    ]);

    let hit_set_id = document.querySelectorAll('form[action*="projects/')[0].action.match(/projects\/([A-Z0-9]+)\/tasks/)[1];
    let assignable_hits_count = props.modalOptions.assignableHitsCount;

    retrieveReturnReviews(hit_set_id, assignable_hits_count);
}

let userApiKey;
let ViewHeaders;

function buildHeaders(userApiKey){
    ViewHeaders = new Headers([
        [`X-VIEW-KEY`, userApiKey],
        [`X-APP-KEY`, `MTurk Suite`],
        [`X-APP-VER`, chrome.runtime.getManifest().version] //SemVer
    ]);
}

chrome.storage.local.get([`options`], keys => {
    userApiKey = keys.options.turkerviewApiKey || ``;
    buildHeaders(userApiKey);
    if (!keys.options.turkerview) return;
    initReturnReviews();
})


const tosMap = new Map([
    [0, `N/A`],
    [1, `<span class="text-muted">Minor Personal Information Violation (Email, Zip, Company Name)</span>`],
    [2, `<span class="text-danger">Major Personal Information Violation (Name, Phone #, SSN)</span>`],
    [3, `<span class="text-warning">SEO/Referral/Review Fraud</span>`],
    [4, `<span class="text-danger">Phishing/Malicious Activity</span>`],
    [9, `<span class="text-muted">Misc/Other</span>`]
]);
const writingMap = new Map([
    [0, ``],
    [1, `Experiential/Write about a time when...`],
    [9, ``]
]);
const downloadsMap = new Map([
    [0, ``],
    [1, `Inquisit Software`],
    [2, `Browser Extension`],
    [3, `Phone/Tablet Apps`],
    [9, ``]
]);
const emMap = new Map([
    [0, ``],
    [1, `Phone Calls`],
    [2, `Webcam / Face requirements`],
    [9, ``]
]);

