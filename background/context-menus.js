chrome.contextMenus.create({
  title: `Launch HIT Finder`,
  contexts: [`browser_action`],
  onclick() {
    chrome.tabs.create({
      url: chrome.runtime.getURL(`hit-finder/hit-finder.html`)
    });
  }
});

chrome.contextMenus.create({
  title: `Launch HIT Catcher`,
  contexts: [`browser_action`],
  onclick() {
    chrome.tabs.create({
      url: chrome.runtime.getURL(`hit_catcher/hit_catcher.html`)
    });
  }
});

chrome.contextMenus.create({
  title: `Launch HIT Tracker`,
  contexts: [`browser_action`],
  onclick() {
    chrome.tabs.create({
      url: chrome.runtime.getURL(`hit_tracker/hit_tracker.html`)
    });
  }
});

chrome.contextMenus.create({
  contexts: [`browser_action`],
  type: `separator`
});

chrome.contextMenus.create({
  title: `GitHub`,
  contexts: [`browser_action`],
  onclick() {
    chrome.tabs.create({ url: `https://github.com/Kadauchi/mturk-suite/` });
  }
});

chrome.contextMenus.create({
  title: `Donate`,
  contexts: [`browser_action`],
  onclick() {
    chrome.tabs.create({
      url: `https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VYB8NZTKRZBFS`
    });
  }
});

chrome.contextMenus.create({
  title: `Input Mturk Worker ID`,
  contexts: [`editable`],
  async onclick(info, tab) {
    const workerId = await StorageGetKey(`workerId`);

    const code = `elem = document.activeElement;
      elem.value += '${workerId}'; 
      elem.dispatchEvent(new Event('change', { bubbles: true }));`;

    chrome.tabs.executeScript(tab.id, {
      code,
      frameId: info.frameId,
      allFrames: true
    });
  }
});

chrome.contextMenus.create({
  title: `Contact Requester`,
  contexts: [`link`],
  targetUrlPatterns: [`https://worker.mturk.com/requesters/*`],
  onclick(info) {
    const match = info.linkUrl.match(/([A-Z0-9]+)/);
    const requesterId = match ? match[1] : null;

    if (requesterId) {
      window.open(
        `https://worker.mturk.com/contact_requester/hit_type_messages/new?hit_type_message[hit_type_id]=YOURMTURKHIT&hit_type_message[requester_id]=${requesterId}`
      );
    }
  }
});

chrome.contextMenus.create({
  title: `HIT Catcher - Once`,
  contexts: [`link`],
  targetUrlPatterns: [`https://worker.mturk.com/projects/*/tasks*`],
  onclick(info) {
    const match = info.linkUrl.match(/projects\/([A-Z0-9]+)\/tasks/);
    const hitSetId = match ? match[1] : null;

    if (hitSetId) {
      chrome.runtime.sendMessage({
        hitCatcher: {
          id: hitSetId,
          name: ``,
          once: true,
          sound: true
        }
      });
    }
  }
});

chrome.contextMenus.create({
  title: `HIT Catcher - Multiple`,
  contexts: [`link`],
  targetUrlPatterns: [`https://worker.mturk.com/projects/*/tasks*`],
  onclick(info) {
    const match = info.linkUrl.match(/projects\/([A-Z0-9]+)\/tasks/);
    const hitSetId = match ? match[1] : null;

    if (hitSetId) {
      chrome.runtime.sendMessage({
        hitCatcher: {
          id: hitSetId,
          name: ``,
          once: false,
          sound: false
        }
      });
    }
  }
});
