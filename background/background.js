chrome.runtime.onUpdateAvailable.addListener(details => {
  const { version } = details;

  const n = new Notification(`Update v${version} is available!`, {
    body: `Click to apply update.`,
    icon: `/media/icon_128.png`,
    requireInteraction: true
  });

  n.onclick = () => chrome.runtime.reload();
});

chrome.runtime.onInstalled.addListener(install => {
  console.log('install/update');
  const open = indexedDB.open(`requesterReviewsDB`, 1);

  open.onsuccess = event => {
    var db = open.result;
    var transaction = db.transaction([`requester`], `readwrite`);
    var objectStore = transaction.objectStore(`requester`);
    var objectStoreRequest = objectStore.clear();
  };

});

chrome.storage.local.get(`blockList`, keys => {
  if (!keys.blockList) {
    chrome.storage.local.set({ blockList: {} });
  }
});

chrome.storage.local.get(`earnings`, keys => {
  if (!keys.earnings) {
    chrome.storage.local.set({ earnings: 0 });
  }
});

chrome.storage.local.get(`includeList`, keys => {
  if (!keys.includeList) {
    chrome.storage.local.set({ includeList: {} });
  }
});

chrome.storage.local.get(`options`, keys => {
  if (!keys.options || keys.options.version !== 1) {
    chrome.storage.local.set({
      options: {
        autoAcceptUnchecker: false,
        blockListOnMturk: true,
        confirmReturnHIT: true,
        dashboardEnhancer: true,
        hitExporter: true,
        hitExporterType: `all`,
        hitTracker: true,
        hitTrackerAutoSync: true,
        hitTrackerDisplayCounts: true,
        hitTrackerDisplayEarnings: true,
        hitTrackerLiveUpdate: true,
        hitDetailsSticky: true,
        paginationLastPage: true,
        queueInfoEnhancer: true,
        rateLimitReloader: true,
        rememberFilter: true,
        requesterReviews: true,
        requesterReviewsTurkerview: true,
        turkerviewApiKey: ``,
        requesterReviewsTurkopticon: true,
        requesterReviewsTurkopticon2: true,
        version: 1,
        themeMts: `default`,
        themeMturk: `default`,
        workspaceExpander: true
      }
    });
  }
});

chrome.storage.local.get(`version`, keys => {
  const { version } = chrome.runtime.getManifest();

  if (!keys.version || keys.version !== version) {
    chrome.storage.local.set({ version });
    
    chrome.tabs.create({
      url: chrome.runtime.getURL(`/change_log/change_log.html`)
    });
  }
});

chrome.storage.local.get(`hitFinder`, keys => {
  if (!keys.hitFinder) {
    chrome.storage.local.set({
      hitFinder: {
        speed: `3000`,

        "filter-search-term": ``,
        "filter-sort": `updated_desc`,
        "filter-page-size": `25`,
        "filter-masters": false,
        "filter-qualified": false,
        "filter-min-reward": `0`,
        "filter-min-available": `0`,
        "filter-min-requester-rating": `0`,

        "alert-new-sound": `sound-1`,
        "alert-include-delay": `30`,
        "alert-include-sound": `voice`,
        "alert-pushbullet-state": `off`,
        "alert-pushbullet-token": ``,

        "display-colored-rows": true,

        "display-recent-column-time": false,
        "display-recent-column-requester": true,
        "display-recent-column-title": true,
        "display-recent-column-available": true,
        "display-recent-column-reward": true,
        "display-recent-column-masters": true,

        "display-logged-column-time": true,
        "display-logged-column-requester": true,
        "display-logged-column-title": true,
        "display-logged-column-available": true,
        "display-logged-column-reward": true,
        "display-logged-column-masters": true,

        "display-included-column-time": true,
        "display-included-column-requester": true,
        "display-included-column-title": true,
        "display-included-column-available": true,
        "display-included-column-reward": true,
        "display-included-column-masters": true
      }
    });
  }
});
