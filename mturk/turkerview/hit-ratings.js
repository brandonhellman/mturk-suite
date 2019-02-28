function hitReviewsTVClass(hourly) {
    if (hourly > 10.50) return `mts-green`;
    if (hourly > 7.25) return `mts-orange`;
    if (hourly > 0.0) return `mts-red`;
    return `unrated`;
  }

  function hitHourlyTVClass(hourly) {
    if (hourly == null) return `text-muted`;
  
    if (hourly > 10.50) return `text-success`;
    if (hourly > 7.25) return `text-warning`;
    if (hourly > 0.0) return `text-danger`;
    return `text-muted`;
  }

function hitDataPopover(button, hit, reward, status = `ok`) {
    let title = ``;
    let content = ``;
    if (status != `ok`) {
        if (status == `invalidUserAuthKey`){
            title = `TurkerView Invalid API Key`;
            content = /*html*/`
            <div class="alert alert-warning" style="font-size: 1rem;">
                <h3>You need a valid TurkerView Auth Key</h3>
                <p>Please <a href="https://turkerview.com/account/api" target="_blank">register & claim your <strong>free</strong> API Key</a> to enable this function.</p>
            </div>`;
        }
    }
    else if (!HitData[hit]) {
        title = HTML`TurkerView HIT Ratings (0 Reviews)`;
        content = HTML`
        <div class="alert alert-warning" style="font-size: 0.857rem; display: ${userApiKey.length == 40 ? `none` : `block`}">
            <h3>You need a valid TurkerView Auth Key</h3>
            <p>Please <a href="https://turkerview.com/account/api" target="_blank">register & claim your <strong>free</strong> API Key</a> by Feb 7th.</p>
        </div>
    <div style="font-size: 1rem; text-align: center;">
        <span class="text-muted">No one has reviewed this HIT yet!</span><br>
        <span><a href="https://turkerview.com/review.php" target="_blank">Be The First!</a></span>
    </div>`;
    } else {
        let avg_completion = HitData[hit] ? HitData[hit].avg_completion : null;
        let avg_hourly = avg_completion !== null ? ((3600/avg_completion)*reward).toFixed(2) : null;
        let min_completion = HitData[hit] ? HitData[hit].min_completion : null;
        let min_hourly = min_completion !== null ? ((3600/min_completion)*reward).toFixed(2) : null;
        let max_completion = HitData[hit] ? HitData[hit].max_completion : null;
        let max_hourly = max_completion !== null ? ((3600/max_completion)*reward).toFixed(2) : null;

        title = HTML`TurkerView HIT Ratings (${HitData[hit].total_reviews} ${HitData[hit].total_reviews == 1 ? `Review` : `Reviews`})`;
        content = /* html */`
    <div>
        <div class="row">
            <div class="alert alert-warning" style="font-size: 0.857rem; display: ${userApiKey.length == 40 ? `none` : `block`}">
                <h3>You need a valid TurkerView Auth Key</h3>
                <p>Please <a href="https://turkerview.com/account/api" target="_blank"><u>register & claim your <strong>free</strong> API Key</u></a> by Feb 7th.</p>
            </div>
            <div class="col-xs-12" style="text-align: center">
                <h3>Average Hourly</h3>
                <span class="${hitHourlyTVClass(avg_hourly)}" style="font-size: 1rem;">$${avg_hourly}</span><span class="text-muted">/hr</span><br>
                <span class="text-muted" style="font-size: 0.857rem;">${moment.utc(HitData[hit].avg_completion*1000).format('HH:mm:ss')} <small>/ time</small></span>
            </div>
            <div class="col-xs-12" style="text-align: center">
                <div class="col-xs-6">
                    <h3>Minimum Hourly</h3>
                    <span class="${hitHourlyTVClass(max_hourly)}" style="font-size: 1rem;">$${max_hourly}</span><span class="text-muted">/hr</span><br>
                    <span class="text-muted" style="font-size: 0.857rem;">${moment.utc(HitData[hit].max_completion*1000).format('HH:mm:ss')} <small>/ time</small></span>
                </div>
                <div class="col-xs-6">
                    <h3>Maximum Hourly</h3>
                    <span class="${hitHourlyTVClass(min_hourly)}" style="font-size: 1rem;">$${min_hourly}</span><span class="text-muted">/hr</span><br>
                    <span class="text-muted" style="font-size: 0.857rem;">${moment.utc(HitData[hit].min_completion*1000).format('HH:mm:ss')} <small>/ time</small></span>
                </div>
                
            </div>
        </div>
    </div>`;
    }
    
    const script = document.createElement(`script`);
    script.textContent = `$(document.currentScript).parent().popover({
      html: true,
      delay: { show: 100, hide: 400 },
      trigger: \`hover focus\`,
      contiainer: \`body\`,
      title: \`${title}\`,
      content: \`${content}\`
    });`;
  
    button.appendChild(script);
  }

  async function hitButtons(json){
    const [dom, props, options] = await Promise.all([
        ReactDOM(`HitSetTable`, `TaskQueueTable`),
        ReactProps(`HitSetTable`, `TaskQueueTable`),
        StorageGetKey(`options`),
        Enabled(`hitExporter`),
      ]);
    
      const { bodyData } = props;

    [...dom.querySelectorAll(`.table-row`)].forEach((row, i) => {
        const hit = bodyData[i].project || bodyData[i];
        let temp_key = hit.requester_id.concat(hit.monetary_reward.amount_in_dollars.toFixed(2), hit.title);

        let hourly = json[temp_key] ? (3600/json[temp_key].avg_completion)*hit.monetary_reward.amount_in_dollars : null;
        const hitButton = HTML`<span class="btn btn-sm text-primary" tabIndex="0" data-tvhit="${temp_key}" data-reward="${hit.monetary_reward.amount_in_dollars.toFixed(2)}"><img src="https://turkerview.com/assets/images/tv-${hitReviewsTVClass(hourly)}.png" style="max-height: 16px;"></img></span>`;

        row
          .querySelector(`.project-name-column`)
          .insertAdjacentHTML(
            `afterbegin`,
            hitButton,
          );
      });
    
      [...dom.querySelectorAll(`[data-tvhit]`)].forEach((button) => {
        const info = button.dataset.tvhit;
        const reward = button.dataset.reward;
    
        button.addEventListener(`click`, (event) => {
          event.stopImmediatePropagation();
        });
    
        hitDataPopover(button, info, reward);
      });
  }
  
  async function hitButtonsException(status){
    const [dom, props, options] = await Promise.all([
        ReactDOM(`HitSetTable`, `TaskQueueTable`),
        ReactProps(`HitSetTable`, `TaskQueueTable`),
        StorageGetKey(`options`),
        Enabled(`hitExporter`),
      ]);
    
      const { bodyData } = props;

    [...dom.querySelectorAll(`.table-row`)].forEach((row, i) => {
        const hit = bodyData[i].project || bodyData[i];
        let temp_key = hit.requester_id.concat(hit.monetary_reward.amount_in_dollars.toFixed(2), hit.title);

        let hourly = null;
        const hitButton = HTML`<span class="btn btn-sm text-primary" tabIndex="0" data-tvhit="${temp_key}" data-reward="${hit.monetary_reward.amount_in_dollars.toFixed(2)}"><img src="https://turkerview.com/assets/images/tv-${hitReviewsTVClass(hourly)}.png" style="max-height: 16px;"></img></span>`;

        row
          .querySelector(`.project-name-column`)
          .insertAdjacentHTML(
            `afterbegin`,
            hitButton,
          );
      });
    
      [...dom.querySelectorAll(`[data-tvhit]`)].forEach((button) => {
        const info = button.dataset.tvhit;
        const reward = button.dataset.reward;
    
        button.addEventListener(`click`, (event) => {
          event.stopImmediatePropagation();
        });
    
        hitDataPopover(button, info, reward, status);
      });
  }

  async function hitRatings() {
    const [dom, props, options] = await Promise.all([
      ReactDOM(`HitSetTable`, `TaskQueueTable`),
      ReactProps(`HitSetTable`, `TaskQueueTable`),
      StorageGetKey(`options`),
      Enabled(`hitExporter`),
    ]);
  
    const { bodyData } = props;

    let hit_keys = [];
    [...dom.querySelectorAll(`.table-row`)].forEach((row, i) => {
        const hit = bodyData[i].project || bodyData[i];
        const temp_key = hit.requester_id.concat(hit.monetary_reward.amount_in_dollars.toFixed(2), hit.title);

        if (!hit_keys.includes(temp_key)) hit_keys.push(temp_key);
    });

    fetch('https://view.turkerview.com/v1/hits/', {
            method: 'POST',
            headers: ViewHeaders,
            body: JSON.stringify(hit_keys)
        }).then(response => {
            if (!response.ok) throw response;

            return response.json();
        }).then(json => {
            HitData = json;
            hitButtons(json);
        }).catch(ex => {
            //console.log(ex);
            if (ex.statusText == `invalidUserAuthKey`) hitButtonsException(ex.statusText);
        });
  }
  
  
let userApiKey;
let ViewHeaders = new Headers([
  [`X-VIEW-KEY`, `UNSET`],
  [`X-APP-KEY`, `MTurk Suite`],
  [`X-APP-VER`, chrome.runtime.getManifest().version] //SemVer
]);
let HitData;

chrome.storage.local.get([`options`], keys => {
    if (!keys.options.turkerview) return;
    userApiKey = keys.options.turkerviewApiKey || ``;
    buildHeaders(userApiKey);
    hitRatings();
});

function buildHeaders(userApiKey){
    ViewHeaders = new Headers([
        [`X-VIEW-KEY`, userApiKey],
        [`X-APP-KEY`, `MTurk Suite`],
        [`X-APP-VER`, chrome.runtime.getManifest().version] //SemVer
    ]);
}

  
  