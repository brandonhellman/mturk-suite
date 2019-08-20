
async function GET_RETURNS({ payload }, sendResponse) {
    fetch(`https://view.turkerview.com/v2/returns/retrieve/?hit_set_id=${payload}`, {
        method: 'GET',
        cache: 'no-cache',
        headers: ViewHeaders
    }).then(response => {
        if (!response.ok) throw response;

        return response.json();
    }).then(data => {
        sendResponse(data);
    }).catch(ex => {
        //ignore it for now
    });
  }

async function GET_HITS_PREVIEW({ payload }, sendResponse) {
    fetch(`https://view.turkerview.com/v1/hits/`, {
        method: 'POST',
        cache: 'no-cache',
        headers: ViewHeaders,
        body: JSON.stringify(payload)
    }).then(response => {
        if (!response.ok) throw response;

        return response.json();
    }).then(data => {
        sendResponse(data);
    }).catch(ex => {
        //ignore it for now
    });
  }

async function GET_HIT_STATS({ payload }, sendResponse) {
    fetch(`https://view.turkerview.com/v1/hits/hit/`, {
        method: 'POST',
        cache: 'no-cache',
        headers: ViewHeaders,
        body: JSON.stringify(payload)
    }).then(response => {
        if (!response.ok) throw response;

        return response.json();
    }).then(data => {
        sendResponse(data);
    }).catch(ex => {
        //ignore it for now
    });
  }

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
      case `GET_RETURN_REVIEWS`:
        GET_RETURNS(request, sendResponse);
        return true;
      case `GET_HITS_PREVIEW`:
        GET_HITS_PREVIEW(request, sendResponse);
        return true;
      case `GET_HIT_STATS`:
        GET_HIT_STATS(request, sendResponse);
        return true;
      default:
        return false;
    }
  });