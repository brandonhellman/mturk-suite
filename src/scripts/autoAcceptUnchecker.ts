import { Store } from 'webext-redux';

import { selectOptions } from '../store/options/selectors';
import { getReactEl } from '../utils/getReactEl';

const store = new Store();

store.ready().then(async () => {
  const options = selectOptions(store.getState());

  if (!options.scripts.autoAcceptUnchecker) {
    return;
  }

  const el = await getReactEl('AutoAcceptCheckbox');
  const checked: HTMLElement = el.querySelector('input:checked');

  if (checked) {
    checked.click();
  }
});
