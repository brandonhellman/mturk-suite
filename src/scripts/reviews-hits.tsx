import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import { selectOptions } from '../store/options/selectors';
import { getReactEl } from '../utils/getReactEl';
import { getReactProps, ReactPropsHitSetTable } from '../utils/getReactProps';

import { Review } from './components/Review';

const store = new Store();

store.ready().then(async () => {
  const options = selectOptions(store.getState());

  if (!options.scripts.turkopticon && !options.scripts.turkerview) {
    return;
  }

  const el = await getReactEl('HitSetTable');
  const props: ReactPropsHitSetTable = await getReactProps('HitSetTable');

  el.querySelectorAll('.table-row').forEach((row, i) => {
    const hit = props.bodyData[i];

    row.querySelectorAll('.requester-column .expand-button').forEach((button: HTMLElement, j) => {
      const react = document.createElement('span');
      button.style.display = 'none';
      button.parentElement.insertAdjacentElement('afterend', react);

      ReactDom.render(
        // @ts-ignore
        <Provider store={store}>
          <Review rid={hit.requester_id} />
        </Provider>,
        react,
      );
    });
  });
});
