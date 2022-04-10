const requestsDB = {};

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const match = details.url.match(/https:\/\/workersandbox.mturk.com\/projects\/([A-Z0-9]+)\/tasks/);

    if (match) {
      requestsDB[details.requestId] = {
        tabId: details.tabId,
        hit_set_id: match[1],
      };
    }
  },
  {
    urls: [`https://workersandbox.mturk.com/projects/*/tasks*`],
    types: [`main_frame`],
  },
  [`requestBody`],
);

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    const request = requestsDB[details.requestId];

    let misses = 0;

    function missedHIT() {
      misses += 1;

      chrome.tabs.sendMessage(
        request.tabId,
        {
          hitMissed: request.hit_set_id,
        },
        (res) => {
          if (!res && misses < 5) {
            setTimeout(missedHIT, 1000);
          }
        },
      );
    }

    if (request) {
      const catcher = chrome.extension
        .getViews()
        .map((o) => o.location.pathname)
        .includes(`/hit_catcher/hit_catcher.html`);

      if (
        catcher &&
        details.url.indexOf(`https://workersandbox.mturk.com/projects/${request.hit_set_id}/tasks`) === -1
      ) {
        setTimeout(missedHIT, 1000);
      }
    }
  },
  {
    urls: [`https://workersandbox.mturk.com/*`],
    types: [`main_frame`],
  },
  [`responseHeaders`],
);

let filterParams = ``;

chrome.webRequest.onCompleted.addListener(
  (details) => {
    const url = new window.URL(details.url);

    if (!details.url.match(/format=json|\.json/)) {
      const params = new window.URLSearchParams(url.search);
      params.delete(`page_number`);
      params.delete(`filters[search_term]`);

      filterParams = params;
    }
  },
  {
    urls: [`https://workersandbox.mturk.com/?*`, `https://workersandbox.mturk.com/projects*`],
    types: [`main_frame`],
  },
  [`responseHeaders`],
);

chrome.webRequest.onBeforeRequest.addListener(
  // eslint-disable-next-line consistent-return
  async (details) => {
    const { rememberFilter } = await StorageGetKey(`options`);

    if (rememberFilter) {
      return {
        redirectUrl: `${details.url}?${filterParams}`,
      };
    }
  },
  {
    urls: [`https://workersandbox.mturk.com/`, `https://workersandbox.mturk.com/projects`],
    types: [`main_frame`],
  },
  [`blocking`],
);
