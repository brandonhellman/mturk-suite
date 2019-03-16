const REVIEWS = {
  turkerview: { db: null, cache: new Set(), ids: new Set(), updated: 0 },
  turkopticon: { db: null, cache: new Set(), ids: new Set(), updated: 0 },
  turkopticon2: { db: null, cache: new Set(), ids: new Set(), updated: 0 },
};

// Initialize the IndexedDBs for TV, TO and TO2.
[`turkerview`, `turkopticon`, `turkopticon2`].forEach((name) => {
  const open = indexedDB.open(name, 1);

  open.onsuccess = (event) => {
    REVIEWS[name].db = event.target.result;
  };

  open.onupgradeneeded = (event) => {
    REVIEWS[name].db = event.target.result;
    REVIEWS[name].db.createObjectStore(`requester`, { keyPath: `id` });
  };
});

const fetchNeverFail = (url, options) =>
  new Promise((resolve) => {
    const fetchURL = () =>
      fetch(url, options)
        .then((response) => resolve(response))
        .catch(() => {
          // setTimeout(fetchURL, 250);
          resolve(null);
        });

    fetchURL();
  });

const fetchOrFail = (url, options) =>
  new Promise((resolve) => {
    const fetchURL = () =>
      fetch(url, options)
        .then((response) => resolve(response))
        .catch(() => {
          // let it go
        });

    fetchURL();
  });

const fetchTurkerview = async (rids) => {
  const storage = await new Promise((resolve) => chrome.storage.local.get([`options`], resolve));

  const headers = new Headers([
    [`X-VIEW-KEY`, storage.options.turkerviewApiKey],
    [`X-APP-KEY`, `MTurk Suite`],
    [`X-APP-VER`, chrome.runtime.getManifest().version],
  ]);

  return fetchOrFail(`https://view.turkerview.com/v1/requesters/?requester_ids=${rids}`, { headers });
};
const fetchTurkopticon = (rids) => fetchNeverFail(`https://turkopticon.ucsd.edu/api/multi-attrs.php?ids=${rids}`);

const fetchTurkopticon2 = (rids) => fetchNeverFail(`https://api.turkopticon.info/requesters?rids=${rids}`);

const turkopticon2Transform = (data) =>
  data.reduce((readable, requester) => {
    const { aggregates } = requester.attributes;
    const reviews = Object.keys(aggregates).reduce((review, time) => {
      const { broken, comm, pending, recommend, rejected, reward, tos } = aggregates[time];

      const reformatted = {
        tos: tos[0],
        broken: broken[0],
        rejected: rejected[0],
        pending: pending > 0 ? (pending / 86400).toFixed(2) : null,
        hourly: reward[1] > 0 ? ((reward[0] / reward[1]) * 3600).toFixed(2) : null,
        comm: comm[1] > 0 ? (comm[0] / comm[1]).toFixed(2) : null,
        recommend: recommend[1] > 0 ? Math.round((recommend[0] / recommend[1]) * 100) : null,
      };

      return { ...review, [time]: reformatted };
    }, {});

    return { ...readable, [requester.id]: reviews };
  }, {});

const getReviews = (rids, name) =>
  new Promise(async (resolve) => {
    const { db } = REVIEWS[name];
    const transaction = db.transaction([`requester`], `readonly`);
    const objectStore = transaction.objectStore(`requester`);

    const reviews = {};

    rids.forEach((rid) => {
      objectStore.get(rid).onsuccess = (event) => {
        reviews[rid] = event.target.result;
      };
    });

    transaction.oncomplete = () => resolve(reviews);
  });

const checkCache = (rids, name) =>
  new Promise((resolve) => {
    const { db } = REVIEWS[name];
    const transaction = db.transaction([`requester`], `readonly`);
    const objectStore = transaction.objectStore(`requester`);

    rids.forEach((rid) => {
      objectStore.get(rid).onsuccess = (event) => {
        const review = event.target.result;

        if (review) {
          // Add review to be updated if it has been 30 minutes.
          if (review.updated < 30 * 60 * 1000) {
            REVIEWS[name].ids.add(rid);
          }
        } else {
          // No review means we need to update now.
          REVIEWS[name].updated = 0;
          REVIEWS[name].ids.add(rid);
        }
      };
    });

    transaction.oncomplete = resolve;
  });

const handleUpdate = (data, name) =>
  new Promise(async (resolve) => {
    const { db } = REVIEWS[name];
    const transaction = db.transaction([`requester`], `readwrite`);
    const objectStore = transaction.objectStore(`requester`);
    const updated = Date.now();

    [...REVIEWS[name].ids].forEach((id) => {
      objectStore.put({ id, updated, ...data[id] });
      REVIEWS[name].ids.delete(id);
    });

    REVIEWS[name].updated = updated;

    transaction.oncomplete = resolve;
  });

const handleDelete = (name) =>
  new Promise(async (resolve) => {
    const { db } = REVIEWS[name];
    const transaction = db.transaction([`requester`], `readwrite`);
    const objectStore = transaction.objectStore(`requester`);
    const objectStoreRequest = objectStore.clear();
    objectStoreRequest.onsuccess = resolve;
  });

const handleTurkerview = () =>
  new Promise(async (resolve) => {
    // await never fail fetch
    // check if we need to clear cache if there is an invalid key
    // await transaction updating database
    const response = await fetchTurkerview([...REVIEWS.turkerview.ids]);

    if (response.ok) {
      const json = await response.json();
      await handleUpdate(json.requesters, `turkerview`);
    } else if (response.statusText === `invalidUserAuthKey` || response.statusText === `dailyLimitExceeded`) {
      await handleDelete(`turkerview`);
    }

    resolve();
  });

const handleTurkopticon = () =>
  new Promise(async (resolve) => {
    const response = await fetchTurkopticon([...REVIEWS.turkopticon.ids]);

    if (response) {
      const json = await response.json();
      await handleUpdate(json, `turkopticon`);
    }

    resolve();
  });

const handleTurkopticon2 = () =>
  new Promise(async (resolve) => {
    const response = await fetchTurkopticon2([...REVIEWS.turkopticon2.ids]);

    if (response) {
      const json = await response.json();
      await handleUpdate(turkopticon2Transform(json.data), `turkopticon2`);
    }

    resolve();
  });

const updateCache = (name) =>
  new Promise(async (resolve) => {
    if (REVIEWS[name].updated < 10 * 60 * 1000 && REVIEWS[name].ids.size > 0) {
      switch (name) {
        case `turkerview`:
          await handleTurkerview();
          break;
        case `turkopticon`:
          await handleTurkopticon();
          break;
        case `turkopticon2`:
          await handleTurkopticon2();
          break;
        default:
        // do nothing
      }

      resolve();
    } else {
      resolve();
    }
  });

async function GET_TURKERVIEW({ payload }, sendResponse) {
  await checkCache(payload, `turkerview`);
  await updateCache(`turkerview`);
  const reviews = await getReviews(payload, `turkerview`);
  sendResponse(reviews);
}

async function GET_TURKOPTICON({ payload }, sendResponse) {
  await Promise.all([checkCache(payload, `turkopticon`), checkCache(payload, `turkopticon2`)]);
  await Promise.all([updateCache(`turkopticon`), updateCache(`turkopticon2`)]);

  const [turkopticon, turkopticon2] = await Promise.all([
    getReviews(payload, `turkopticon`),
    getReviews(payload, `turkopticon2`),
  ]);

  const reviews = payload.reduce((acc, rid) => {
    const review = {
      average: 0,
      turkopticon: turkopticon[rid],
      turkopticon2: turkopticon2[rid],
    };

    const toPay = review.turkopticon && review.turkopticon.attrs ? review.turkopticon.attrs.pay : null;
    const to2Pay = review.turkopticon2 && review.turkopticon2.all ? review.turkopticon2.all.hourly / 3 : null;

    if (toPay || to2Pay) {
      review.average = [toPay, to2Pay]
        .filter((pay) => pay !== null)
        .map((pay, i, filtered) => Number(pay) / filtered.length)
        .reduce((a, b) => a + b);
    }
    return { ...acc, [rid]: review };
  }, {});

  sendResponse(reviews);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case `GET_TURKERVIEW`:
      GET_TURKERVIEW(request, sendResponse);
      return true;
    case `GET_TURKOPTICON`:
      GET_TURKOPTICON(request, sendResponse);
      return true;
    default:
      return false;
  }
});
