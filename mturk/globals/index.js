
const MTS_enabled = (value) =>
  new Promise((resolve) =>
    chrome.storage.local.get('options', (result) =>
      resolve(result.options[value]),
    ),
  );
