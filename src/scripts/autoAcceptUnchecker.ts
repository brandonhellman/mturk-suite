import { Store } from 'webext-redux';

import { AppState } from '../store';
import { getReactEl } from '../utils/getReactEl';

const store = new Store<AppState>();

store.ready().then(async () => {
  if (!store.getState().options.scripts.autoAcceptUnchecker) {
    return;
  }

  const el = await getReactEl('AutoAcceptCheckbox');
  const checked = el.querySelector<HTMLInputElement>('input:checked');

  if (checked) {
    checked.click();
  }
});
