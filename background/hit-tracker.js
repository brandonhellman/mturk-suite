function trackerDB() {
  return new Promise(resolve => {
    const open = indexedDB.open(`hitTrackerDB`, 1);

    open.onsuccess = event => {
      resolve(event.target.result);
    };

    open.onupgradeneeded = event => {
      const db = event.target.result;

      const hits = db.createObjectStore(`hit`, { keyPath: `hit_id` });

      [`requester_id`, `requester_name`, `state`, `title`, `date`].forEach(
        value => {
          hits.createIndex(value, value, { unique: false });
        }
      );

      const days = db.createObjectStore(`day`, { keyPath: `date` });

      [
        `assigned`,
        `returned`,
        `abandoned`,
        `submitted`,
        `approved`,
        `rejected`,
        `pending`,
        `earnings`
      ].forEach(value => {
        days.createIndex(value, value, { unique: false });
      });

      resolve(db);
    };
  });
}

async function hitTrackerGetProjected() {
  let projected = 0;

  const db = await trackerDB();
  const transaction = db.transaction([`hit`], `readonly`);
  const objectStore = transaction.objectStore(`hit`);
  const index = objectStore.index(`date`);
  const range = IDBKeyRange.only(MturkDate());

  index.openCursor(range).onsuccess = event => {
    const cursor = event.target.result;

    if (cursor) {
      const hit = cursor.value;

      if (hit.state.match(/Submitted|Pending|Approved|Paid/)) {
        projected += hit.reward.amount_in_dollars;
      }

      cursor.continue();
    }
  };

  transaction.oncomplete = () => {
    chrome.storage.local.set({
      earnings: projected
    });
  };
}

async function getTrackerCounts(request, sendResponse) {
  const db = await trackerDB();
  const transaction = db.transaction([`hit`], `readonly`);
  const objectStore = transaction.objectStore(`hit`);
  const key = Object.keys(request)[0];
  const value = request[key];

  const counts = {};

  objectStore
    .index(key)
    .openCursor(IDBKeyRange.only(value)).onsuccess = event => {
    const cursor = event.target.result;

    if (cursor) {
      const hit = cursor.value;
      const { state } = hit;
      const count = counts[state];
      counts[state] = count ? count + 1 : 1;
      if (counts[state] < 5001) cursor.continue();
      else counts[state] = `5000+`;
    }
  };

  transaction.oncomplete = () => {
    sendResponse(counts);
  };
}

const accepted = {};

async function hitTrackerSubmitted(args) {
  const { answer, assignmentId } = args;
  const hitId = accepted[assignmentId];

  if (typeof hitId === `string`) {
    const db = await trackerDB();
    const transaction = db.transaction([`hit`], `readwrite`);
    const objectStore = transaction.objectStore(`hit`);
    const request = objectStore.get(hitId);

    request.onerror = () => {};
    request.onsuccess = event => {
      const { result } = event.target;

      result.answer = answer;
      result.state = `Submitted`;

      objectStore.put(result);
    };

    transaction.oncomplete = () => {
      hitTrackerGetProjected();
    };
  }
}

async function hitTrackerUpdate(args) {
  const { hit } = args;
  const { assignment_id } = args;

  accepted[assignment_id] = hit.hit_id;

  const db = await trackerDB();
  const objectStore = db.transaction([`hit`], `readwrite`).objectStore(`hit`);
  objectStore.put(hit);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { trackerGetCounts, trackerSubmitted, trackerUpdate } = request;

  if (trackerGetCounts) {
    getTrackerCounts(trackerGetCounts, sendResponse);
    return true;
  }

  if (trackerSubmitted) {
    hitTrackerSubmitted(trackerSubmitted);
  }

  if (trackerUpdate) {
    hitTrackerUpdate(trackerUpdate);
  }

  if (request.hitTrackerGetProjected) {
    hitTrackerGetProjected();
  }

  return false;
});

trackerDB();
hitTrackerGetProjected();
