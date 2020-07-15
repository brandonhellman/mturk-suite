chrome.omnibox.onInputChanged.addListener((text) => {
  chrome.omnibox.setDefaultSuggestion({
    description: `Search Mechanical Turk for ${text}`,
  });
});

chrome.omnibox.onInputEntered.addListener((text) => {
  chrome.tabs.getSelected(null, (tab) => {
    chrome.tabs.update(tab.id, {
      url: ENCODE`https://workersandbox.mturk.com/?filters%5Bsearch_term%5D=${text}`,
    });
  });
});
