import { browser } from 'webextension-scripts/polyfill';

import { AppStore } from '../../store';
import { selectMturk } from '../../store/mturk/selectors';

export function contextMenus(store: AppStore) {
  browser.contextMenus.create({
    title: 'Input MTurk Worker ID',
    contexts: ['editable'],
    onclick(info, tab) {
      const mturk = selectMturk(store.getState());

      const code = `elem = document.activeElement;
          elem.value += '${mturk.workerId}'; 
          elem.dispatchEvent(new Event('change', { bubbles: true }));`;

      browser.tabs.executeScript(tab.id, {
        code,
        frameId: info.frameId,
      });
    },
  });
}
