function StorageGet(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}

async function StorageGetKey(key) {
  const storage = await StorageGet(key);
  return storage[key];
}

// eslint-disable-next-line no-unused-vars
function Enabled(name) {
  return new Promise(async resolve => {
    const options = await StorageGetKey(`options`);

    if (options[name]) resolve();
    else
      window.console.warn(`"${name}" did not resolve because it is disabled.`);
  });
}
