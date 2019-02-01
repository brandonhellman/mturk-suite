const REVIEWS = {
  turkerview: { cache: new Set(), ids: new Set(), updated: 0 },
  turkopticon: { cache: new Set(), ids: new Set(), updated: 0 },
  turkopticon2: { cache: new Set(), ids: new Set(), updated: 0 },
};

const database = (name) =>
  new Promise((resolve) => {
    const open = indexedDB.open(name, 1);

    open.onsuccess = (event) => {
      resolve(event.target.result);
    };

    open.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(`requester`, { keyPath: `id` });
      resolve(db);
    };
  });

const getReviews1 = (rids, name) =>
  new Promise(async (resolve) => {
    const db = await database(name);
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
  new Promise(async (resolve) => {
    const db = await database(name);
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

    transaction.oncomplete = () => resolve();
  });

const handleTurkerview = () =>
  new Promise((resolve) => {
    // await never fail fetch
    // check if we need to clear cache if there is an invalid key
    // await transaction updating database
    resolve();
  });

const handleTurkopticon = () =>
  new Promise((resolve) => {
    // await never fail fetch
    // await transaction updating database
    resolve();
  });

const handleTurkopticon2 = () =>
  new Promise((resolve) => {
    // await never fail fetch
    // transform data
    // await transaction updating database
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
  console.log(`GET_TURKERVIEW`, payload);
  await checkCache(payload, `turkerview`);
  await updateCache(`turkerview`);
  const reviews = await getReviews1(payload, `turkerview`);
  sendResponse(reviews);
}

async function GET_TURKOPTICON({ payload }, sendResponse) {
  console.log(`GET_TURKOPTICON`, payload);
  await checkCache(payload, `turkopticon`);
  await updateCache(`turkopticon`);
  const reviews = await getReviews1(payload, `turkopticon`);
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
