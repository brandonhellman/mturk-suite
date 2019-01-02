/* eslint-disable camelcase */
function requesterReviewsClass(review) {
  const { average } = review;
  if (average > 3.75) return `success`;
  if (average > 2.25) return `warning`;
  if (average > 0.0) return `danger`;
  return `muted`;
}

function requesterReviewsTVClass(review) {
  if (!review.turkerview) return `unrated`;

  const hourly = review.turkerview.ratings.hourly;
  if (hourly > 10.50) return `mts-green`;
  if (hourly > 7.25) return `mts-orange`;
  if (hourly > 0.0) return `mts-red`;
  return `unrated`;
}

function requesterHourlyTVClass(hourly) {
  if (hourly == null) return `text-muted`;

  if (hourly > 10.50) return `text-success`;
  if (hourly > 7.25) return `text-warning`;
  if (hourly > 0.0) return `text-danger`;
  return `text-muted`;
}

function requesterReviewsTurkerViewHTML(hit, review, options) {
  const { requester_id } = hit;
  const { turkerview } = review;
  const { requesterReviewsTurkerview } = options;

  if (!requesterReviewsTurkerview) return ``;

  if (!turkerview)
    return HTML`<div class="col-xs-12">
      <h2 style="text-align: center;">
        <a class="text-primary" href="https://turkerview.com/requesters/${requester_id}" target="_blank">TurkerView</a>
      </h2>
      <div>No Reviews</div>
      <div>
        <a href="https://turkerview.com/review.php" target="_blank">Review on TV</a>
      </div>
    </div>`;

  const { ratings, rejections, reviews, blocks } = turkerview;
  const { hourly, pay, fast, comm } = ratings;

  return /*html*/`
    <h2 style="text-align: center;">
      <a class="text-primary" href="https://turkerview.com/requesters/${requester_id}" target="_blank">TurkerView</a> <span class="text-muted"><small>(${reviews.toLocaleString()} Reviews)</small></span>
    </h2>
    <div class="row" style="font-size: 0.857rem;">
      <div class="col-xs-1"></div>

      <div class="col-xs-10">
        <div class="row">
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted"><strong>Hourly Avg:</strong></p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted pull-right"><strong class="${requesterHourlyTVClass(hourly)}">$${hourly}/hr</strong></p></div>
        </div>
        <hr style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
        <div class="row">
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted">Pay Sentiment:</p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted pull-right"><span class="text-${pay.class}">${pay.text} <i class="fa ${pay.faicon}"></i></span></p></div>
        </div>
        <div class="row">
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted">Approval Time:</p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted pull-right"><span class="text-${fast.class}">${fast.text} <i class="fa ${fast.faicon}"></i></span></p></div>
        </div>
        <div class="row">
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem;" class="text-muted">Communication:</p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem;" class="text-muted pull-right"><span class="text-${comm.class}">${comm.text} <i class="fa ${comm.faicon}"></i></span></p></div>
        </div>
        <div class="row">
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem; text-align: center;" class="text-muted">${rejections === 0 ? '<i class="fa fa-check" style="color: rgba(0, 128, 0, 1);"></i> No Rejections' : '<i class="fa fa-times" style="color: rgba(255, 0, 0, 1);"></i> Rejected Work'}</p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem; text-align: center;" class="text-muted">${blocks === 0 ? '<i class="fa fa-check" style="color: rgba(0, 128, 0, 1);"></i> No Blocks' : '<i class="fa fa-times" style="color: rgba(255, 0, 0, 1);"></i> Blocks Reported'}</p></div>
        </div>
        <div class="row">
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem; text-align: center;" class="text-muted"><a href="https://turkerview.com/requesters/${requester_id}}" target="_blank">Overview</a></p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem; text-align: center;" class="text-muted"><a href="https://turkerview.com/requesters/${requester_id}}/reviews" target="_blank">Reviews</a></p></div>
        </div>
      </div>

      <div class="col-xs-1"></div>
    </div>
    <div style="text-align: center;">
      <a href="https://turkerview.com/review.php" target="_blank">How Do I Review on TV?</a>
    </div>
    <hr>
  `;
}

function requesterReviewsTurkopticonHTML(hit, review, options) {
  const { requester_id, requester_name, hit_set_id, title } = hit;
  const { turkopticon } = review;
  const { requesterReviewsTurkopticon } = options;

  if (!requesterReviewsTurkopticon) return ``;

  const url = new URL(`https://turkopticon.ucsd.edu/report`);
  url.searchParams.set(`report[hit_id]`, hit_set_id);
  url.searchParams.set(`report[hit_names]`, title);
  url.searchParams.set(`requester[amzn_id]`, requester_id);
  url.searchParams.set(`requester[amzn_name]`, requester_name);

  if (!turkopticon)
    return HTML`<div class="col-xs-4" style="width: 150px;">
      <h2>
        <a class="text-primary" href="https://turkopticon.ucsd.edu/${requester_id}" target="_blank">Turkopticon</a>
      </h2>
      <div>No Reviews</div>
      <div>
        <a href="${url.toString()}" target="_blank">Review on TO</a>
      </div>
    </div>`;

  const { attrs, reviews, tos_flags } = turkopticon;
  const { pay, fast, comm, fair } = attrs;

  return HTML`<div class="col-xs-4" style="width: 150px;">
    <h2>
      <a class="text-primary" href="https://turkopticon.ucsd.edu/${requester_id}" target="_blank">Turkopticon</a>
    </h2>
    <div>
      <table style="width: 100%">
        <tr> <td>Pay</td>     <td>${pay} / 5</td>       </tr>
        <tr> <td>Fast</td>    <td>${fast} / 5</td>      </tr>
        <tr> <td>Comm</td>    <td>${comm} / 5</td>      </tr>
        <tr> <td>Fair</td>    <td>${fair} / 5</td>      </tr>
        <tr> <td>Reviews</td> <td>${reviews}</td>   </tr>
        <tr> <td>ToS</td>     <td>${tos_flags}</td> </tr>
      </table>
    </div>
    <div>
      <a href="${url.toString()}" target="_blank">Review on TO</a>
    </div>
  </div>`;
}

function requesterReviewsTurkopticon2HTML(hit, review, options) {
  const { requester_id, requester_name } = hit;
  const { turkopticon2 } = review;
  const { requesterReviewsTurkopticon2 } = options;

  if (!requesterReviewsTurkopticon2) return ``;

  const url = new URL(`https://turkopticon.info/reviews/new`);
  url.searchParams.set(`rid`, requester_id);
  url.searchParams.set(`name`, requester_name);

  if (!turkopticon2)
    return HTML`<div class="col-xs-4" style="width: 150px;">
      <h2>
        <a class="text-primary" href="https://turkopticon.info/requesters/${requester_id}" target="_blank">Turkopticon 2</a>
      </h2>
      <div>No Reviews</div>
      <div>
        <a href="${url.toString()}" target="_blank">Review on TO2</a>
      </div>
    </div>`;

  const {
    tos,
    broken,
    rejected,
    pending,
    hourly,
    comm,
    recommend
  } = turkopticon2.all;

  return HTML`<div class="col-xs-4" style="width: 150px;">
    <h2>
      <a class="text-primary" href="https://turkopticon.info/requesters/${requester_id}" target="_blank">Turkopticon 2</a>
    </h2>
    <div>
      <table style="width: 100%">
        <tr> <td>Hourly</td>    <td>$${hourly}</td>   </tr>
        <tr> <td>Pending</td>   <td>${pending}</td>   </tr>
        <tr> <td>Response</td>  <td>${comm}</td>      </tr>
        <tr> <td>Recommend</td> <td>${recommend}</td> </tr>
        <tr> <td>Rejected</td>  <td>${rejected}</td>  </tr>
        <tr> <td>ToS</td>       <td>${tos}</td>       </tr>
        <tr> <td>Broken</td>    <td>${broken}</td>    </tr>
      </table>
    </div>
    <div>
      <a href="${url.toString()}" target="_blank">Review on TO2</a>
    </div>
  </div>`;
}

async function requesterReviews() {
  const [dom, props] = await Promise.all([
    ReactDOM(`HitSetTable`, `TaskQueueTable`, `HitStatusDetailsTable`),
    ReactProps(`HitSetTable`, `TaskQueueTable`, `HitStatusDetailsTable`),
    Enabled(`requesterReviews`)
  ]);

  const rids = [
    ...new Set(
      props.bodyData.map(
        cV => (cV.project ? cV.project.requester_id : cV.requester_id)
      )
    )
  ];

  const response = await new Promise(resolve =>
    chrome.runtime.sendMessage({ getRequesterReviews: rids }, resolve)
  );

  const options = await StorageGetKey(`options`);

  dom.querySelectorAll(`.mobile-row > a > .expand-button`).forEach(mobileBtn => mobileBtn.style.display = `none`);

  
  document.querySelector(`.me-bar`)
  document.querySelector(`.me-bar > .row > .col-xs-7`).insertAdjacentHTML(`beforeend`, `<span class="pull-right text-success" data-toggle="modal" data-target="#turkerview-finder-announcement-modal" style="cursor: pointer;"><i class="fa fa-info-circle"></i> Click Here - TurkerView's API Is Upgrading</span>`);

  document.body.insertAdjacentHTML(
    `beforeend`,
    /* html */`<div class="modal" id="turkerview-finder-announcement-modal" style="margin-top: 60px;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">TurkerView's API Is Upgrading</h2>
            <button type="button" class="close text-danger" data-dismiss="modal" style="margin-right: 0;">&times;</button>
          </div>
          <div class="modal-body text-dark">
          <p>Sorry for the intrusion, but we're expanding our services & infrastructure and making huge improvements to the way we deliver information & data to Turkers in 2019!</p>
                  <p>Part of those changes mean that without an API Key MTS wont be able to retrieve information from our servers soon. You can find more information about the changes <a href="https://forum.turkerview.com/threads/preview-turkerviews-new-view-api-infrastructure.1959/" target="_blank">on our announcement here</a>.</p>
                  <p>For now, though, we've upgraded our API & left access open so we don't disrupt your day to day workflow. Thanks for all of the support!</p>
                  <p>Make sure to register & get your new access keys to our upgraded API by <a href="https://turkerview.com/account/api/" target="_blank">visiting your account dashboard</a>.</p>
                  <p>You can save your TurkerView API Key in MTurk Suite's Options panel.</p>
          </div>
          <div class="modal-footer" style="display: block; padding: 15px;">
          </div>
        </div>
      </div>
    </div>`
  );


  dom.querySelectorAll(`.table-row`).forEach((row, i) => {
    const hit = props.bodyData[i].project || props.bodyData[i];
    const { requester_id, requester_name } = hit;
    const review = response.reviews[requester_id];

    row.querySelectorAll(`.requester-column`).forEach(col => {
        col.querySelectorAll(`.expand-button`).forEach(btn => {
          const container = document.createElement(`div`)
          container.style.display = `inline-block`;
          container.addEventListener(`click`, event => {
            event.stopImmediatePropagation();
          });
    
          const requesterTurkerViewReviews = document.createElement(`span`)
          requesterTurkerViewReviews.className = `btn btn-sm btn-default`;
          requesterTurkerViewReviews.roll = `button`;
          requesterTurkerViewReviews.tabIndex = 0;
    
          const turkerviewIcon = document.createElement(`img`)
          turkerviewIcon.src = `https://turkerview.com/assets/images/tv-${requesterReviewsTVClass(
            review
          )}.png`
          turkerviewIcon.style.maxHeight = `16px`
          requesterTurkerViewReviews.appendChild(turkerviewIcon)
          container.appendChild(requesterTurkerViewReviews);
    
          const button = document.createElement(`i`);
          button.roll = `button`;
          button.tabIndex = 0;
          button.className = `btn btn-sm fa fa-user text-${requesterReviewsClass(
            review
          )}`;
          container.appendChild(button);
    
          const script = document.createElement(`script`);
          script.textContent = `$(document.currentScript).parent().popover({
            html: true,
            delay: { show: 500, hide: 200 },
            trigger: \`hover focus\`,
            title: \`${requester_name} [${requester_id}]\`,
            content: \`
              <div class="container">
                ${requesterReviewsTurkerViewHTML(hit, review, options)}
              </div>
              <div class="container">
                ${requesterReviewsTurkopticonHTML(hit, review, options)}
                ${requesterReviewsTurkopticon2HTML(hit, review, options)}
              </div>\`
          });`;
          container.appendChild(script);
    
          const expand = btn;
          expand.parentElement.insertAdjacentElement(`afterend`, container);
          expand.style.display = `none`;
        });
    });
  });
    

  document.head.insertAdjacentHTML(
    `beforeend`,
    HTML`<style>.popover { max-width: 1000px; }</style>`
  );
}

requesterReviews();
