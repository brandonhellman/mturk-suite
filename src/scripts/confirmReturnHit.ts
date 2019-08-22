import { Store } from 'webext-redux';

import { selectOptions } from '../store/options/selectors';

const store = new Store();

store.ready().then(() => {
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement;

    if (form.querySelector('[value="delete"]')) {
      const options = selectOptions(store.getState());

      if (!options.scripts.confirmReturnHit) {
        return;
      }

      event.preventDefault();

      if (window.confirm('Are you sure you want to return this HIT?')) {
        form.submit();
      }
    }
  });
});
