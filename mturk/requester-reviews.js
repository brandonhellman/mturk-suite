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

function requesterReviewsTurkerViewHTML(hit, review, options) {
  const { requester_id } = hit;
  const { turkerview } = review;
  const { requesterReviewsTurkerview } = options;

  if (!requesterReviewsTurkerview) return ``;

  if (!turkerview)
    return HTML`<div class="col-xs-4" style="width: 150px;">
      <h2>
        <a class="text-primary" href="https://turkerview.com/requesters/${requester_id}" target="_blank">TurkerView</a>
      </h2>
      <div>No Reviews</div>
      <div>
        <a href="https://turkerview.com/review.php" target="_blank">Review on TV</a>
      </div>
    </div>`;

  const { ratings, rejections, reviews, blocks } = turkerview;
  const { hourly, pay, fast, comm } = ratings;

  return HTML`<div class="col-xs-4" style="width: 150px;">
    <h2>
      <a class="text-primary" href="https://turkerview.com/requesters/${requester_id}" target="_blank">TurkerView</a>
    </h2>
    <div>
      <table style="width: 100%">
        <tr> <td>Hourly</td> <td>$${hourly}</td>    </tr>
        <tr> <td>Pay</td>    <td>${pay} / 5</td>        </tr>
        <tr> <td>Fast</td>   <td>${fast} / 5</td>       </tr>
        <tr> <td>Comm</td>   <td>${comm} / 5</td>       </tr>
        <tr> <td>Reviews</td>    <td>${reviews.toLocaleString()}</td>        </tr>
        <tr> <td>Rej</td>    <td>${rejections}</td> </tr>
        <tr> <td>Blocks</td> <td>${blocks}</td>     </tr>
      </table>
    </div>
    <div>
      <a href="https://turkerview.com/review.php" target="_blank">Review on TV</a>
    </div>
  </div>`;
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

  dom.querySelectorAll(`.table-row`).forEach((row, i) => {
    const hit = props.bodyData[i].project || props.bodyData[i];
    const { requester_id, requester_name } = hit;
    const review = response.reviews[requester_id];

    row.querySelectorAll(`.expand-button`).forEach(btn => {
      if (btn.parentElement.className === `hidden`) console.log('hidden expander btn, stahp this shit');
      const container = document.createElement(`div`)
      container.style.display = `inline-block`;
      container.addEventListener(`click`, event => {
        event.stopImmediatePropagation();
      });

      const requesterTurkerViewReviews = document.createElement(`span`)
      requesterTurkerViewReviews.className = `btn btn-sm btn-default`;

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
        delay: { show: 500, hide: 100 },
        trigger: \`hover focus\`,
        title: \`${requester_name} [${requester_id}]\`,
        content: \`<div class="container">
            ${requesterReviewsTurkerViewHTML(hit, review, options)}
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

  document.head.insertAdjacentHTML(
    `beforeend`,
    HTML`<style>.popover { max-width: 1000px; }</style>`
  );
}

requesterReviews();
