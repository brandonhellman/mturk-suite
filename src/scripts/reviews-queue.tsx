import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import { selectOptions } from '../store/options/selectors';
import { getReactEl } from '../utils/getReactEl';
import { getReactProps, ReactPropsTaskQueueTable } from '../utils/getReactProps';

import { Review } from './components/Review';

const store = new Store();

store.ready().then(async () => {
  const options = selectOptions(store.getState());

  if (!options.scripts.turkopticon && !options.scripts.turkerview) {
    return;
  }

  const el = await getReactEl('TaskQueueTable');
  const props: ReactPropsTaskQueueTable = await getReactProps('TaskQueueTable');

  el.querySelectorAll('.table-row').forEach((row, i) => {
    const hit = props.bodyData[i];

    row.querySelectorAll('.requester-column .expand-button').forEach((button: HTMLElement, j) => {
      const react = document.createElement('span');

      button.style.display = 'none';
      button.parentElement.insertAdjacentElement('afterend', react);

      ReactDom.render(
        // @ts-ignore
        <Provider store={store}>
          <Review rid={hit.project.requester_id} rname={hit.project.requester_name} />
        </Provider>,
        react,
      );
    });
  });
});
