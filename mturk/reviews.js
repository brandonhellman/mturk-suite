const turkerviewClass = (hourly) => {
  if (hourly > 10.5) return `text-success`;
  if (hourly > 7.25) return `text-warning`;
  if (hourly > 0.0) return `text-danger`;
  return `text-muted`;
};

const turkerviewIcon = ({ wages }) => {
  if (!wages) return `unrated`;
  if (wages.average.wage > 10.5) return `mts-green`;
  if (wages.average.wage > 7.25) return `mts-orange`;
  if (wages.average.wage > 0.0) return `mts-red`;
  return `unrated`;
};

const turkopticonClass = ({ average }) => {
  if (average > 3.75) return `success`;
  if (average > 2.25) return `warning`;
  if (average > 0.0) return `danger`;
  return `muted`;
};

const turkerviewHTML = (hit, review) => {
  const { requester_id } = hit;
  const userApiKey = false;

  if (!review.ratings)
    return HTML`<div class="col-xs-12" style="font-size: 1rem;">
      <h2 style="text-align: center;">
        <a class="text-primary" href="https://turkerview.com/requesters/${requester_id}" target="_blank">TurkerView</a>
      </h2>
      <div class="alert alert-warning" style="font-size: 1rem; display: ${userApiKey.length === 40 ? `none` : `block`}">
        <h3>You need a valid TurkerView Auth Key</h3>
        <p>Please <a href="https://turkerview.com/account/api" target="_blank"><u>register & claim your <strong>free</strong> API Key</u></a> to enable this function.</p>
      </div>
      <div class="row">
        <div class="col-xs-12" style="text-align: center;"><p><strong>Oh no!</strong><br>We haven't met this Requester yet.</p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem; text-align: center;" class="text-muted"><a href="https://turkerview.com/requesters/${requester_id}}" target="_blank">Profile</a></p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem; text-align: center;" class="text-muted"><a href="https://turkerview.com/requesters/${requester_id}}/reviews" target="_blank">Reviews</a></p></div>
      </div>
      <div>
        <div style="text-align: center; font-size: 0.714rem;">
          <a href="https://turkerview.com/review.php" target="_blank">How Do I Review on TV?</a>
        </div>
      </div>
    </div>`;

  const { ratings, wages, rejections, reviews, blocks, user_reviews } = review;
  const { pay, fast, comm } = ratings;

  return `
    <div class="alert alert-warning" style="font-size: 0.857rem; display: ${
      userApiKey.length === 40 ? `none` : `block`
    }">
        <h3>You need a valid TurkerView Auth Key</h3>
        <p>Please <a href="https://turkerview.com/account/api" target="_blank"><u>register & claim your <strong>free</strong> API Key</u></a> to enable this function.</p>
    </div>
    <h2 style="text-align: center;">
      <a class="text-primary" href="https://turkerview.com/requesters/${requester_id}" target="_blank">TurkerView</a> <span class="text-muted"><small>(${reviews.toLocaleString()} Reviews)</small></span>
    </h2>
    <div class="row" style="font-size: 0.857rem;">

      <div class="col-xs-12">
        <div class="row">
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted"><strong>Hourly Avg:</strong></p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted pull-right"><strong class="${turkerviewClass(
            wages.average.wage,
          )}">$${wages.average.wage}/hr</strong></p></div>
        </div>
        <hr style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
        <div class="row">
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted">Pay Sentiment:</p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted pull-right"><span class="text-${
            pay.class
          }">${pay.text} <i class="fa ${pay.faicon}"></i></span></p></div>
        </div>
        <div class="row">
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted">Approval Time:</p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted pull-right"><span class="text-${
            fast.class
          }">${fast.text} <i class="fa ${fast.faicon}"></i></span></p></div>
        </div>
        <div class="row">
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem;" class="text-muted">Communication:</p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem;" class="text-muted pull-right"><span class="text-${
            comm.class
          }">${comm.text} <i class="fa ${comm.faicon}"></i></span></p></div>
        </div>
        <div class="row">
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem; text-align: center;" class="text-muted">${
            rejections === 0
              ? `<i class="fa fa-check" style="color: rgba(0, 128, 0, 1);"></i> No Rejections`
              : `<i class="fa fa-times text-danger"></i> <a href="https://turkerview.com/requesters/${requester_id}/reviews/rejected/" target="_blank">Rejected Work</a>`
          }</p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem; text-align: center;" class="text-muted">${
            blocks === 0
              ? `<i class="fa fa-check" style="color: rgba(0, 128, 0, 1);"></i> No Blocks`
              : `<i class="fa fa-times" style="color: rgba(255, 0, 0, 1);"></i> Blocks Reported`
          }</p></div>
        </div>
        <div class="row">
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem; text-align: center;" class="text-muted"><a href="https://turkerview.com/requesters/${requester_id}}" target="_blank">Profile</a></p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.25rem; text-align: center;" class="text-muted"><a href="https://turkerview.com/requesters/${requester_id}}/reviews" target="_blank">Reviews</a></p></div>
        </div>
      </div>

    </div>
    <hr>
    <h2 style="text-align: center;">
      <span class="text-primary" onclick="return void;">Your Reviews</a> <span class="text-muted"><small>(${user_reviews.toLocaleString()} Reviews)</small></span>
    </h2>
    <div class="row" style="font-size: 0.857rem;">
      <div class="col-xs-12">
        <div class="row" style="display: ${user_reviews === 0 ? `none` : `block`};">
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted"><strong>Hourly Avg:</strong></p></div>
          <div class="col-xs-6"><p style="margin-bottom: 0.15rem;" class="text-muted pull-right"><strong class="${turkerviewClass(
            wages.user_average.wage,
          )}">$${wages.user_average.wage}/hr</strong></p></div>
        </div>
        <span class="text-muted" style="display: ${
          user_reviews > 0 ? `none` : `block`
        }; text-align: center;">You don't have any data for this Requester!
          <div style="text-align: center; font-size: 0.714rem;">
            <a href="https://turkerview.com/review.php" target="_blank">How Do I Review on TV?</a>
          </div>
        </span>
      </div>
    </div>`;
};

const turkopticonHTML = (hit, review) => {
  const { requester_id, requester_name, hit_set_id, title } = hit;
  const { turkopticon } = review;

  const url = new URL(`https://turkopticon.ucsd.edu/report`);
  url.searchParams.set(`report[hit_id]`, hit_set_id);
  url.searchParams.set(`report[hit_names]`, title);
  url.searchParams.set(`requester[amzn_id]`, requester_id);
  url.searchParams.set(`requester[amzn_name]`, requester_name);

  if (!turkopticon.attrs) {
    return HTML`<div class="col-xs-6" style="width: 100%; text-align: center;">
      <h2>
        <a class="text-primary" href="https://turkopticon.ucsd.edu/${requester_id}" target="_blank">Turkopticon</a>
      </h2>
      <div>No Reviews</div>
      <div>
        <a href="${url.toString()}" target="_blank">Review on TO</a>
      </div>
    </div>`;
  }

  const { attrs, reviews, tos_flags } = turkopticon;
  const { pay, fast, comm, fair } = attrs;

  return HTML`<div class="col-xs-6" style="width: 100%; text-align: center;">
    <h2>
      <a class="text-primary" href="https://turkopticon.ucsd.edu/${requester_id}" target="_blank">Turkopticon</a>
    </h2>
    <div>
      <table style="width: 100%">
        <tr> <td>Pay</td>     <td>${pay} / 5</td>   </tr>
        <tr> <td>Fast</td>    <td>${fast} / 5</td>  </tr>
        <tr> <td>Comm</td>    <td>${comm} / 5</td>  </tr>
        <tr> <td>Fair</td>    <td>${fair} / 5</td>  </tr>
        <tr> <td>Reviews</td> <td>${reviews}</td>   </tr>
        <tr> <td>ToS</td>     <td>${tos_flags}</td> </tr>
      </table>
    </div>
    <div>
      <a href="${url.toString()}" target="_blank">Review on TO</a>
    </div>
  </div>`;
};

const turkopticon2HTML = (hit, review) => {
  const { requester_id, requester_name } = hit;
  const { turkopticon2 } = review;

  const url = new URL(`https://turkopticon.info/reviews/new`);
  url.searchParams.set(`rid`, requester_id);
  url.searchParams.set(`name`, requester_name);

  if (!turkopticon2.all) {
    return HTML`<div class="col-xs-6" style="width: 100%; text-align: center;">
      <h2>
        <a class="text-primary" href="https://turkopticon.info/requesters/${requester_id}" target="_blank">Turkopticon 2</a>
      </h2>
      <div>No Reviews</div>
      <div>
        <a href="${url.toString()}" target="_blank">Review on TO2</a>
      </div>
    </div>`;
  }

  const { tos, broken, rejected, pending, hourly, comm, recommend } = turkopticon2.all;

  return HTML`<div class="col-xs-6" style="width: 100%; text-align: center;">
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
};

async function handleTurkerview(rids) {
  const reviews = await MTS_sendMessage({ type: `GET_TURKERVIEW`, payload: rids });

  rids.forEach((rid) => {
    const review = reviews[rid];

    document.querySelectorAll(`.review-${rid}`).forEach((el) => {
      const hit = JSON.parse(el.dataset.hit);

      const span = document.createElement(`span`);
      span.className = `btn btn-sm btn-default`;
      span.tabIndex = 0;

      const icon = document.createElement(`img`);
      icon.src = `https://turkerview.com/assets/images/tv-${turkerviewIcon(review)}.png`;
      icon.style.maxHeight = `16px`;
      span.appendChild(icon);
      el.appendChild(span);

      const script = document.createElement(`script`);
      script.textContent = `$(document.currentScript).parent().popover({
        html: true,
        delay: { show: 100, hide: 400 },
        trigger: \`hover focus\`,
        title: \`${hit.requester_name} [${hit.requester_id}]\`,
        content: \`
          <div class="container">
            ${turkerviewHTML(hit, review)}
          </div>\`
      });`;
      span.appendChild(script);
    });
  });
}

async function handleTurkopticon(rids) {
  const reviews = await MTS_sendMessage({ type: `GET_TURKOPTICON`, payload: rids });

  rids.forEach((rid) => {
    const review = reviews[rid];

    document.querySelectorAll(`.review-${rid}`).forEach((el) => {
      const hit = JSON.parse(el.dataset.hit);

      const icon = document.createElement(`i`);
      icon.tabIndex = 0;
      icon.className = `btn btn-sm fa fa-user text-${turkopticonClass(review)}`;
      el.appendChild(icon);

      const script = document.createElement(`script`);
      script.textContent = `$(document.currentScript).parent().popover({
        html: true,
        delay: { show: 500, hide: 200 },
        trigger: \`hover focus\`,
        title: \`${hit.requester_name} [${hit.requester_id}]\`,
        content: \`
          <div class="container">
            ${turkopticonHTML(hit, review)}
            ${turkopticon2HTML(hit, review)}
          </div>\`
      });`;
      icon.appendChild(script);
    });
  });
}

async function handleReviews(turkerview, turkopticon) {
  const [element, props] = await MTS_elementAndProps(`HitSetTable`, `TaskQueueTable`, `HitStatusDetailsTable`);
  const rids = props.bodyData.map((obj) => obj.requester_id || obj.project.requester_id);
  const unique_rids = [...new Set(rids)];

  element.querySelectorAll(`.table-row`).forEach((row, i) => {
    const hit = props.bodyData[i].project || props.bodyData[i];

    row.querySelectorAll(`.requester-column, .requester-name-column`).forEach((col) => {
      col.querySelectorAll(`.expand-button`).forEach((btn) => {
        const container = document.createElement(`div`);
        container.className = `review-${hit.requester_id}`;
        container.dataset.hit = JSON.stringify(hit);
        container.style.display = `inline-block`;
        container.addEventListener(`click`, (event) => {
          event.stopImmediatePropagation();
        });

        const expand = btn;
        expand.style.display = `none`;
        expand.parentElement.insertAdjacentElement(`afterend`, container);
      });
    });
  });

  if (turkerview) {
    handleTurkerview(unique_rids);
  }

  if (turkopticon) {
    handleTurkopticon(unique_rids);
  }
}

(async function reviews() {
  const turkerview = await MTS_enabled(`turkerview`);
  const turkopticon = await MTS_enabled(`turkopticon`);

  if (turkerview || turkopticon) {
    handleReviews(turkerview, turkopticon);
  }
})();
