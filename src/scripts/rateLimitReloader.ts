import { Store } from 'webext-redux';

import { selectOptions } from '../store/options/selectors';

const store = new Store();

store.ready().then(() => {
  const options = selectOptions(store.getState());

  if (!options.scripts.rateLimitReloader) {
    return;
  }

  const error = document.querySelector('.error-page');

  if (error && error.textContent.includes('You have exceeded')) {
    window.setTimeout(window.location.reload.bind(window.location), 1000);
  }
});
