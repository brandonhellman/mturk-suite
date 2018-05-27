function reviewsDB() {
  return new Promise(resolve => {
    const open = indexedDB.open(`requesterReviewsDB`, 1);

    open.onsuccess = event => {
      resolve(event.target.result);
    };

    open.onupgradeneeded = event => {
      const db = event.target.result;
      db.createObjectStore(`requester`, { keyPath: `id` });
      resolve(db);
    };
  });
}

// eslint-disable-next-line no-unused-vars
function getReview(rid) {
  return new Promise(async resolve => {
    const db = await reviewsDB();
    const transaction = db.transaction([`requester`], `readonly`);
    const objectStore = transaction.objectStore(`requester`);
    const request = objectStore.get(rid);

    request.onsuccess = event => resolve(event.target.result);
  });
}

function getReviews(rids) {
  return new Promise(async resolve => {
    const db = await reviewsDB();
    const transaction = db.transaction([`requester`], `readonly`);
    const objectStore = transaction.objectStore(`requester`);

    const reviews = {};

    rids.forEach(rid => {
      objectStore.get(rid).onsuccess = event => {
        reviews[rid] = event.target.result || { id: rid, time: 0 };
      };
    });

    transaction.oncomplete = () => resolve(reviews);
  });
}

async function saveReviews(reviews) {
  const db = await reviewsDB();
  const transaction = db.transaction([`requester`], `readwrite`);
  const objectStore = transaction.objectStore(`requester`);
  const time = new Date().getTime();

  Object.keys(reviews).forEach(rid => {
    const review = reviews[rid];
    review.id = rid;
    review.time = time;
    objectStore.put(review);
  });
}

function updateCheck(reviews) {
  return new Promise(async resolve => {
    const time = new Date().getTime() - 1800000;
    const update = Object.keys(reviews).some(rid => reviews[rid].time < time);
    resolve(update);
  });
}

function formatResponse(response) {
  return new Promise(async resolve => {
    const json = await response.json();

    if (response.url.includes(`https://api.turkopticon.info/`)) {
      const formattedTO2 = json.data.reduce((readable, requester) => {
        const { aggregates } = requester.attributes;
        const reviews = Object.keys(aggregates).reduce((review, time) => {
          const {
            broken,
            comm,
            pending,
            recommend,
            rejected,
            reward,
            tos
          } = aggregates[time];

          const reformatted = {
            tos: tos[0],
            broken: broken[0],
            rejected: rejected[0],
            pending:
              pending > 0 ? `${(pending / 86400).toFixed(2)} days` : null,
            hourly:
              reward[1] > 0 ? (reward[0] / reward[1] * 3600).toFixed(2) : null,
            comm:
              comm[1] > 0 ? `${Math.round(comm[0] / comm[1] * 100)}%` : null,
            recommend:
              recommend[1] > 0
                ? `${Math.round(recommend[0] / recommend[1] * 100)}%`
                : null
          };

          return { ...review, [time]: reformatted };
        }, {});

        return { ...readable, [requester.id]: reviews };
      }, {});

      resolve(formattedTO2);
    } else {
      resolve(json);
    }
  });
}

function fetchReviews(site, url) {
  return new Promise(async resolve => {
    try {
      const response = await Fetch(url, undefined, 5000);
      const json = response.ok ? await formatResponse(response) : null;
      resolve({ site, json });
    } catch (error) {
      resolve({ site, json: null });
    }
  });
}

function averageReviews(reviews) {
  return new Promise(async resolve => {
    const {
      requesterReviewsTurkerview,
      requesterReviewsTurkopticon,
      requesterReviewsTurkopticon2
    } = await StorageGetKey(`options`);

    const avg = Object.keys(reviews).reduce((obj, rid) => {
      const review = reviews[rid];

      if (review) {
        const tv = requesterReviewsTurkerview ? review.turkerview : null;
        const to = requesterReviewsTurkopticon ? review.turkopticon : null;
        const to2 = requesterReviewsTurkopticon2 ? review.turkopticon2 : null;

        const tvPay = tv ? tv.ratings.pay : null;
        const tvHrly = tv ? tv.ratings.hourly / 3 : null;
        const toPay = to ? to.attrs.pay : null;
        const to2Pay = to2 ? to2.all.hourly / 3 : null;

        if (tvPay || tvHrly || toPay || to2Pay) {
          const average = [tvPay, tvHrly, toPay, to2Pay]
            .filter(pay => pay !== null)
            .map((pay, i, filtered) => Number(pay) / filtered.length)
            .reduce((a, b) => a + b);
          review.average = average;
        }
      }

      if (!review.average) review.average = 0;

      return { ...obj, [rid]: review };
    }, {});

    resolve(avg);
  });
}

function updateReviews(reviews) {
  return new Promise(async resolve => {
    const rids = Object.keys(reviews);

    const updates = await Promise.all([
      fetchReviews(
        `turkerview`,
        `https://api.turkerview.com/api/v1/requesters/?ids=${rids}`
      ),
      fetchReviews(
        `turkopticon`,
        `https://turkopticon.ucsd.edu/api/multi-attrs.php?ids=${rids}`
      ),
      fetchReviews(
        `turkopticon2`,
        `https://api.turkopticon.info/requesters?rids=${rids}`
      )
    ]);

    const updated = rids.reduce((obj, rid) => {
      const review = updates.reduce((o, update) => {
        const { site, json } = update;
        const data =
          (json ? json[rid] : null) ||
          (reviews[rid] ? reviews[rid][site] : null);
        return { ...o, [site]: data };
      }, {});

      return { ...obj, [rid]: review };
    }, {});

    const averaged = await averageReviews(updated);
    window.console.log(`averaged`, averaged);

    resolve(averaged);
    saveReviews(averaged);
  });
}

async function reviewsForMTurk(rids, sendResponse) {
  const reviews = await getReviews(rids);
  const needsUpdate = await updateCheck(reviews);

  sendResponse({
    rids,
    reviews: needsUpdate ? await updateReviews(reviews) : reviews
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { getRequesterReviews } = request;

  if (getRequesterReviews) {
    reviewsForMTurk(getRequesterReviews, sendResponse);
    return true;
  }

  return false;
});

reviewsDB();
