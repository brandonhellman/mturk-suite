console.log(`we're on the task page`);

function returnReviewsModal(hit_set_id, requester_id, reward, userApiKey){
    return /* html */`
<div class="modal fade in" id="mts-tvReturnModal" style="display: none; z-index: 11000">
    <div id="mts-tv-return-dialog" class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button id="mts-tv-return-modal-close" type="button" class="close" data-dismiss="modal"><svg class="close-icon" data-reactid=".8.0.0.0.0.0"><g fill="none" stroke="#555" class="close-icon-graphic" stroke-width="2.117" stroke-linecap="round" data-reactid=".8.0.0.0.0.0.0"><path d="M1.2 1.3l7.4 7.5M1.2 8.8l7.4-7.5" data-reactid=".8.0.0.0.0.0.0.0"></path></g></svg></button>
                <h2 class="modal-title">Submit a TurkerView Return Report (MTS)</h2>
            </div>
            <div class="modal-body">
                <div id="mts-return-review-alert" class="alert alert-dismissable alert-success hide">
                        <button type="button" class="close" data-dismiss="alert">×</button>
                        <h4>Thank you!</h4>
                        <p>Your review for has been added!</p>
                </div>
                <form id="mts-tv-return-review" action="https://turkerview.com/api/v2/returns/submit/" method="POST">
                    <div class="row" style="margin-bottom: .7rem;">
                        <div class="col-xs-12 text-muted">
                        <h3 id="return-wage-est" style="text-align: center;"></h3>
                        </div>
                    </div>
                    <div class="row">
                    <h2>Reason for returning?</h2>
                        <div class="col-xs-12 text-muted form-group">
                            <label><input type="checkbox" name="underpaid"> Underpaid</label><small> - use this if the HIT isn't worth the time involved to finish it.</small>
                            <p id="mts-progressest" style="display: none; padding-left: 30px;">Progress Estimate: 
                            <select name="progressSelect" id="mts-progressSelect">
                                <option>Unsure</option>
                                <option value=".075">5-10% Complete</option>
                                <option value=".175">10-25% Complete</option>
                                <option value=".375">25-50% Complete</option>
                                <option value=".625">50-75% Complete</option>
                                <option value=".875">75-100% Complete</option>
                            </select>
                            <span id="mts-estVal"></span>
                            </p>
                        </div>
                        
                        <div class="col-xs-12 text-muted form-group">
                            <label><input type="checkbox" name="broken"> Broken</label><small> - the HIT cannot be completed - do NOT use this for no survey code.</small>
                        </div>
                        
                        <div class="col-xs-12 text-muted form-group">
                            <label><input type="checkbox" name="unpaid_screener"> Unpaid Screener</label><small> - use this if you were screened out without compensation.</small>
                        </div>
                        
                        <div class="col-xs-12 text-muted form-group">
                            <label><input type="checkbox" name="tos"> ToS Violation</label>
                            <div id="mts-tos_toggle" style="padding-left: 30px; display: none;">
                                <label style="display: block;"><input type="radio" value="1" name="tos_type"> Personally Identifiable Information (PII) Minor <small>(Email, Zip, Company Name)</small></label>
                                <label style="display: block;"><input type="radio" value="2" name="tos_type"> Personally Identifiable Information (PII) Major <small>(Full Name, Phone #, SSN)</small></label>
                                <label style="display: block;"><input type="radio" value="3" name="tos_type"> SEO/Referral/Review Fraud</label>
                                <label style="display: block;"><input type="radio" value="4" name="tos_type"> Phishing/Malicious Activity</label>
                                <label style="display: block;"><input type="radio" value="9" name="tos_type"> Misc/Other</label>
                            </div>
                            
                        </div>
                        
                        <div class="col-xs-12 text-muted form-group">
                            <label><input type="checkbox" name="writing"> Writing</label><small> - use if this HIT requires annoying "write about a time when" prompts.</small>
                            <div id="mts-writing_toggle" style="padding-left: 30px; display: none;">
                                <label style="display: block;"><input type="radio" value="1" name="writing_type"> Experiential Writing <small>"Write about a time when..."</small></label>
                                <label style="display: block;"><input type="radio" value="9" name="writing_type"> Misc/Other</label>
                                <p style="font-size: 85%; margin-left: 20px;">While Misc/Other requires writing usually copying the writing prompt is enough to get the point across to other users (please try not to disclose survey content, though!)</p>
                            </div>
                        </div>
                        
                        <div class="col-xs-12 text-muted form-group">
                            <label><input type="checkbox" name="downloads"> Downloads / Installs</label>
                            <div id="mts-downloads_toggle" style="padding-left: 30px; display: none;">
                                <label style="display: block;"><input type="radio" value="1" name="downloads_type"> Inquisit <small> - use if this HIT utilizes the unpopular Inquisit plugin.</small></label>
                                <label style="display: block;"><input type="radio" value="2" name="downloads_type"> Browser Extension</label>
                                <label style="display: block;"><input type="radio" value="3" name="downloads_type"> Phone/Tablet Apps</label>
                                <label style="display: block;"><input type="radio" value="9" name="downloads_type"> Misc/Other</label>
                            </div>
                        </div>
                        
                        <div class="col-xs-12 text-muted form-group">
                            <label><input type="checkbox" name="em"> Extraordinary Measures</label>
                            <div id="mts-em_toggle" style="padding-left: 30px; display: none;">
                                <label style="display: block;"><input type="radio" value="1" name="em_type"> Phone Calls</label>
                                <label style="display: block;"><input type="radio" value="2" name="em_type"> Webcam/Face requirements</label>
                                <label style="display: block;"><input type="radio" value="9" name="em_type"> Misc/Other</label>
                            </div>
                        </div>
                        
                    </div>
                    <div class="row">
                        <div class="col-xs-12 text-muted">
                        <h2>Comment</h2>
                        <textarea name="comment" rows="4" style="width: 100%;" placeholder="Leave a comment..."></textarea>
                        <span id="mts-comment-required" style="display: none;" class="text-danger">* Required<small class="text-muted"> - Please leave at least a short note with your review to help other workers avoid the same problem.</small></span>
                        <p id="mts-comment-length" style="display: none;" class="text-muted"></p>
                        </div>
                    </div>
                    <input type="hidden" name="group_id" value="${hit_set_id}">
                    <input type="hidden" name="requester_id" value="${requester_id}">
                    <input type="hidden" name="reward" value="${reward}">
                    <input type="hidden" name="elapsed_work_time">
                    <input type="hidden" name="userApiKey" value="${userApiKey}">
                    <input type="hidden" name="appname" value="MTurk Suite">
                    <input type="hidden" name="version" value="${chrome.runtime.getManifest().version}">
                    <div class="row" style="margin-bottom: 0">
                        <div class="col-xs-12 text-muted">
                        <button type="submit" class="btn btn-primary pull-right">Submit Data & Return HIT</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<div id="mts-tv-return-modal-backdrop" class="modal-backdrop fade in" style="display: none; z-index: 10999"></div>`;
}

function returnReviewModalListeners(){
    const inputForm = document.getElementById(`mts-tv-return-review`);
    let minCommentLength = 20;

    inputForm.querySelector(`input[name=underpaid]`).addEventListener(`change`, function(event){
        if (event.target.checked) document.getElementById(`mts-progressest`).style.display = `block`;
        else {
            document.getElementById(`mts-progressest`).style.display = `none`;
            document.getElementById(`mts-progressSelect`).selectedIndex = 0;
            document.getElementById(`mts-estVal`).innerText = ``;
        }
    });

    document.getElementById(`mts-progressSelect`).addEventListener(`change`, function(event){
        let estimated_progress = event.target[event.target.selectedIndex].value;
        if (estimated_progress == "Unsure"){
            document.getElementById(`mts-estVal`).innerText = ``;
            return;
        }
        let reward = inputForm.querySelector(`input[name=reward]`).value;
        let elapsed_work_time = inputForm.querySelector(`input[name=elapsed_work_time]`).value*1000;
        let estimated_completion_time = elapsed_work_time/estimated_progress;
        let ect = estimated_completion_time/1000;
        let min = Math.floor(ect/60);
        let sec = Math.floor(ect%60);
        let estimated_hourly = (3600/(estimated_completion_time/1000)) * reward;
        document.getElementById(`mts-estVal`).innerText = min + ":"+sec + "s / $" + (estimated_hourly).toFixed(2) + "/hr";
    });

    inputForm.querySelector(`input[name=tos]`).addEventListener(`change`, function(event){
        if (event.target.checked) document.getElementById(`mts-tos_toggle`).style.display = `block`;
        else {
            document.getElementById(`mts-tos_toggle`).style.display = `none`;
            inputForm.querySelectorAll(`input[name=tos_type]`).forEach(input => { input.checked = false; })
        }
    });

    inputForm.querySelector(`input[name=writing]`).addEventListener(`change`, function(event){
        if (event.target.checked) document.getElementById(`mts-writing_toggle`).style.display = `block`;
        else {
            document.getElementById(`mts-writing_toggle`).style.display = `none`;
            inputForm.querySelectorAll(`input[name=writing_type]`).forEach(input => { input.checked = false; })
        }
    });

    inputForm.querySelector(`input[name=downloads]`).addEventListener(`change`, function(event){
        if (event.target.checked) document.getElementById(`mts-downloads_toggle`).style.display = `block`;
        else {
            document.getElementById(`mts-downloads_toggle`).style.display = `none`;
            inputForm.querySelectorAll(`input[name=downloads_type]`).forEach(input => { input.checked = false; })
        }
    });

    inputForm.querySelector(`input[name=em]`).addEventListener(`change`, function(event){
        if (event.target.checked) document.getElementById(`mts-em_toggle`).style.display = `block`;
        else {
            document.getElementById(`mts-em_toggle`).style.display = `none`;
            inputForm.querySelectorAll(`input[name=em_type]`).forEach(input => { input.checked = false; })
        }
    });

    inputForm.querySelector(`textarea[name=comment]`).addEventListener(`input`, function(event){
        let currentLength = event.target.value.length;
        document.getElementById(`mts-comment-length`).innerText = `Please be descriptive so other workers can better understand your review, currently at ${currentLength} / ${minCommentLength} minimum characters`; 
    });
    
    inputForm.querySelectorAll(`input`).forEach(input => {
        input.addEventListener(`change`, function(event){
            let name = event.target.name;
            let val = event.target.value;
            if (
                (name == 'tos_type' && val == 9 && event.target.checked) ||
                (name == 'writing_type' && val == 9 && event.target.checked) ||
                (name == 'downloads_type' && val == 9 && event.target.checked) ||
                (name == 'em_type' && val == 9 && event.target.checked) ||
                (name == 'underpaid' && event.target.checked) ||
                (name == 'broken' && event.target.checked)
                ){
                    inputForm.querySelector(`textarea[name=comment]`).setAttribute(`minlength`, minCommentLength);
                    inputForm.querySelector(`textarea[name=comment]`).required = true;
                    document.getElementById(`mts-comment-required`).style.display = `block`;
                    document.getElementById(`mts-comment-length`).style.display = `block`;
                }
            else{
                inputForm.querySelector(`textarea[name=comment]`).removeAttribute(`minlength`);
                inputForm.querySelector(`textarea[name=comment]`).required = false;
                document.getElementById(`mts-comment-required`).style.display = `none`;
                document.getElementById(`mts-comment-length`).style.display = `none`;
                }
        })
    });

    
    
    inputForm.addEventListener(`submit`, function(event){
        event.preventDefault();

        inputForm.querySelector(`button[type=submit]`).disabled = true;
        var formData = new FormData(inputForm);
        
        fetch(inputForm.action, {
            method: `POST`,
            body: formData,
            headers: ViewHeaders
        }).then(response => {
            if (!response.ok) throw response
            
            return response.json();
        }).then(response => {
            const noticeAlert = document.getElementById(`mts-return-review-alert`);
            noticeAlert.classList.remove(`alert-success`);
            noticeAlert.classList.remove(`alert-warning`);
            noticeAlert.classList.remove(`alert-danger`);
            noticeAlert.classList.add(`alert-${response.class}`);
            noticeAlert.classList.remove(`hide`);
            noticeAlert.innerHTML = response.html;

            if (response.status == 'success'){
                setTimeout(function(){ 
                    document.querySelectorAll(`form[action*="rtrn"]`)[0].submit();
                }, 1000)
            } else inputForm.querySelector(`button[type=submit]`).disabled = false;
            
        }).catch(exception => {
            const MainContainer = document.getElementById(`mts-return-review-alert`);
            if (exception.statusText == 'invalidUserAuthKey') MainContainer.innerHTML = `
        <div id="tvjs-view-error" class="alert alert-danger">
            <h4>We need an API Key!</h4>
            <p>Sorry! One place we have to enforce API Keys immediately is submitting data otherwise TurkerView doesn't know who you are in order to assign credit for the review.</p>
            <p>You can claim your free API key (or support the site with a subscription!) from your <a href="https://turkerview.com/account/api/" target="_blank" style="text-decoration: underline;">TurkerView account API dashboard.</a></p>
        </div>`;
            else if (exception.statusText == 'dailyLimitExceeded') MainContainer.innerHTML = `
        <div id="tvjs-view-error" class="alert alert-danger">
            <h4>Your TurkerView API Key has hit its daily quota limit.</h4>
            <p>Please upgrade to a subscription plan from your <a href="https://turkerview.com/account/api/" target="_blank">TurkerView account API dashboard.</a> or leave a review to increase quota.</p>
        </div>`;
            MainContainer.classList.remove('alert-success');
            MainContainer.classList.remove('alert-warning');
            MainContainer.classList.remove('alert-danger');
            MainContainer.classList.remove('hide');
        });
        

        
    })
    
}

function returnReviewForm(){

}

function closeReturnReviewModal(){
    document.getElementById(`mts-tv-return-modal-backdrop`).style.display = `none`;
    document.getElementById(`mts-tvReturnModal`).style.display = `none`;
    document.querySelector(`body`).classList.remove(`global-modal-open`)
    document.querySelector(`body`).classList.remove(`modal-open`)
}

function closeReturnReviewDataModal(){
    document.getElementById(`mts-tv-return-warning-data-modal-backdrop`).style.display = `none`;
    document.getElementById(`mts-tvReturnWarningDataModal`).style.display = `none`;
    document.querySelector(`body`).classList.remove(`global-modal-open`)
    document.querySelector(`body`).classList.remove(`modal-open`)
}

function retrieveReturnReviews(hit_set_id, assignable_hits_count){
    let found_in_storage = false;
    Object.keys(localStorage)
        .forEach(function(key){
            if (/^tv-return-data/.test(key)) {
                let json = JSON.parse(localStorage.getItem(key));
                let now = moment.tz('America/Los_Angeles');
                let difference_ms = moment(now).diff(moment(json['date']));
                if (difference_ms > 450000){
                    localStorage.removeItem(key); // delete after 1 day
                    return;
                }
                if (json['group_id'] != hit_set_id) return;

                found_in_storage = true;

                buildReturnWarnings(json);
            }
        });

    if (found_in_storage) return;

    fetch(`https://view.turkerview.com/v1/returns/retrieve/?hit_set_id=${hit_set_id}`, {
        method: 'GET',
        cache: 'no-cache',
        headers: ViewHeaders
    }).then(response => {
        if (!response.ok) throw response;

        return response.json();
    }).then(data => {
        if (data.length === 0) return;
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
        for (i = 0; i < data.length; i++){
            //let localUserIgnore = JSON.parse(localStorage.getItem('tv-return-ignore-list')) || [];
            //if (localUserIgnore.includes(data[i].user_id)) continue;

            reward = data[i].reward;
            total_time_in_ms += data[i].elapsed_work_time;
            underpaid_total += data[i].underpaid;
            broken_total += data[i].broken;
            unpaid_screener_total += data[i].unpaid_screener;
            tos_total += data[i].tos;
            writing_total += data[i].writing;
            downloads_total += data[i].downloads;
            em_total += data[i].extraordinary_measures;

            let comment_prefix = '';
            if (data[i].underpaid == 1){
                let hourly = (3600/(data[i].elapsed_work_time/1000))*(parseFloat(reward)).toFixed(2);
                comment_prefix = `[Marked Underpaid @ $${hourly.toFixed(2)}/hr]<br>`;
            }

            if (data[i].unpaid_screener == 1){
                screened_time_total += data[i].elapsed_work_time;

                let time_in_seconds = data[i].elapsed_work_time/1000;
                let min = Math.floor(time_in_seconds/60);
                let sec = (time_in_seconds%60).toFixed(0);
                comment_prefix += `[Screened out @${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}]<br>`;
            }

            if (data[i].tos == 1) comment_prefix += `${tosMap.get(data[i].tos_type)}<br>`;

            if (data[i].writing == 1) comment_prefix += `${writingMap.get(data[i].writing_type)}<br>`;
            if (data[i].downloads == 1) comment_prefix += `${downloadsMap.get(data[i].downloads_type)}<br>`;
            if (data[i].extraordinary_measures == 1) comment_prefix += `${emMap.get(data[i].em_type)}<br>`;

            let comment_object = {
                user_id: data[i].user_id,
                username: data[i].username,
                date: data[i].date,
                tos_type: data[i].tos_type,
                comment: comment_prefix + data[i].comment }
            comments.push(comment_object);
        }

        let objectToStore = {
            group_id: hit_set_id,
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

    document.querySelectorAll(`.mts-tv-return-warn`).forEach(el => {
        el.insertAdjacentHTML(`beforebegin`, `<a ${highest_warning_class == 'hidden' ? 'style="display: none;"' : ''} class="btn btn-danger mts-tv-return-warning-data-launcher" href="#" style="margin-right: 5px;"><i class="fa fa-fw fa-warning"></i></a>`);
    })

    document.querySelectorAll(`.task-project-title`).forEach(el => {
        el.insertAdjacentHTML(`beforebegin`, `<div ${highest_warning_class == 'hidden' ? 'style="display: none;"' : ''}><i class="fa fa-warning ${highest_warning_class} mts-tv-return-warning-data-launcher" style="cursor: pointer; padding-right: 3px;"></i></div>`);
    })

    let btnHtml = `<i class="fa fa-warning fa-fw ${highest_warning_class} mts-tv-return-warning-data-launcher" style="line-height: 1rem; cursor: pointer; ${highest_warning_class == 'hidden' ? 'display: none;' : ''}" data-toggle="tooltip" data-title="Oh shit!"></i>`;

    document.getElementById(`mtsHourlyContainer`).insertAdjacentHTML(`beforebegin`, btnHtml);

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
<script>

</script>
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
    <p>You can claim your free API key (or support the site with a subscription!) from your <a href="https://turkerview.com/account/api/" target="_blank">TurkerView account API dashboard.</a></p>
</div>`);
    else if (exception.statusText == 'dailyLimitExceeded') MainContainer.insertAdjacentHTML(`afterbegin`, `
<div id="tvjs-view-error" class="alert alert-danger">
    <h4>Your TurkerView API Key has hit its daily quota limit.</h4>
    <p>Please upgrade to a subscription plan from your <a href="https://turkerview.com/account/api/" target="_blank">TurkerView account API dashboard.</a> or leave a review to increase quota.</p>
</div>`);
}

async function initReturnReviews(){
    localStorage.setItem(`mts-return-reviews`, moment.tz(`America/Los_Angeles`));
    const [dom, props] = await Promise.all([
        ReactDOM(`ShowModal`),
        ReactProps(`ShowModal`)
    ]);

    let requester_name = props.modalOptions.requesterName;
    let requester_id = props.modalOptions.contactRequesterUrl.match(/requester_id%5D=(.*?)&/)[1];
    let title = props.modalOptions.projectTitle;
    let reward = props.modalOptions.monetaryReward.amountInDollars;
    let hit_set_id = document.querySelectorAll('form[action*="projects/')[0].action.match(/projects\/([A-Z0-9]+)\/tasks/)[1];
    let assignable_hits_count = props.modalOptions.assignableHitsCount;
    //let hitKey = 'tv_'+today+"_"+gid;

    

    document.querySelectorAll(`form[action*=rtrn_top]`)[0].insertAdjacentHTML(`beforebegin`, `<a class="btn btn-warning mts-tv-return-warn" style="margin-right: 5px;">Review & Return</a>`);
    document.querySelector(`footer`).insertAdjacentHTML(`beforebegin`, returnReviewsModal(hit_set_id, requester_id, reward, userApiKey));

    document.getElementById(`mts-tv-return-modal-backdrop`).addEventListener(`click`, function(){
        closeReturnReviewModal();
    });
    document.getElementById(`mts-tv-return-modal-close`).addEventListener(`click`, function(){
        closeReturnReviewModal();
    });
    document.getElementById(`mts-tvReturnModal`).addEventListener(`click`, function(){
        closeReturnReviewModal();
    });

    document.getElementById(`mts-tv-return-dialog`).addEventListener(`click`, function(e){
        e.stopPropagation();
    });

    let els = document.getElementsByClassName(`mts-tv-return-warn`);
    Array.prototype.forEach.call(els, function(el){
        el.addEventListener(`click`, function(){
            document.querySelector(`body`).classList.add(`global-modal-open`);
            document.querySelector(`body`).classList.add(`modal-open`);
            document.getElementById(`mts-tvReturnModal`).style.display = `block`;
            document.getElementById(`mts-tv-return-modal-backdrop`).style.display = `block`;

            document.querySelector(`input[name=elapsed_work_time]`).value = workDuration();
        })
    });

    retrieveReturnReviews(hit_set_id, assignable_hits_count);
   returnReviewModalListeners();

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
    userApiKey = keys.options.turkerviewApiKey;
    buildHeaders(userApiKey);
    initReturnReviews();
})