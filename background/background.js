chrome.runtime.onUpdateAvailable.addListener(details => {
  const { version } = details;

  const n = new Notification(`Update v${version} is available!`, {
    body: `Click to apply update.`,
    icon: `/media/icon_128.png`,
    requireInteraction: true
  });

  n.onclick = () => chrome.runtime.reload();
});

chrome.storage.local.get(`blockList`, keys => {
  const { blockList } = keys;

  if (!blockList) {
    chrome.storage.local.set({ blockList: {} });
  }
});

chrome.storage.local.get(`includeList`, keys => {
  const { includeList } = keys;

  if (!includeList) {
    chrome.storage.local.set({ includeList: {} });
  }
});

chrome.storage.local.get(`options`, keys => {
  const { options } = keys;

  if (!options || options.version !== 1) {
    chrome.storage.local.set({
      options: {
        autoAcceptChecker: true,
        blockListOnMturk: true,
        confirmReturnHIT: true,
        dashboardEnhancer: true,
        hitExporter: true,
        hitExporterType: `all`,
        hitTrackerDisplayCounts: true,
        hitTrackerDisplayEarnings: true,
        hitDetailsSticky: true,
        paginationLastPage: true,
        queueInfoEnhancer: true,
        rateLimitReloader: true,
        rememberFilter: true,
        requesterReviews: true,
        requesterReviewsTurkerview: true,
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
