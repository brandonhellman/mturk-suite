import { Store } from 'webext-redux';

import { AppState } from '../store';
import { selectOptions } from '../store/options/selectors';
import { getReactEl } from '../utils/getReactEl';

const store = new Store<AppState>();

store.ready().then(async () => {
  const options = selectOptions(store.getState());

  if (!options.scripts.autoAcceptUnchecker) {
    return;
  }

  const el = await getReactEl('AutoAcceptCheckbox');
  const checked = el.querySelector<HTMLInputElement>('input:checked');

  if (checked) {
    checked.click();
  }
});
