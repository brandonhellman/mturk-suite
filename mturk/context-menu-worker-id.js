async function contextMenuWorkerId() {
  const { textToCopy } = await ReactProps(`common/CopyText`);
  chrome.storage.local.set({ workerId: textToCopy });
}

contextMenuWorkerId();
