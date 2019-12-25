import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import { getReactEl } from '../utils/getReactEl';
import { getReactProps, ReactPropsHitStatusDetailsTable } from '../utils/getReactProps';

import RequesterInfo from './components/RequesterInfo';
import RequesterTurkerview from './components/RequesterTurkerview';
import RequesterTurkopticon from './components/RequesterTurkopticion';

const store = new Store();

store.ready().then(async () => {
  const el = await getReactEl('HitStatusDetailsTable');
  const props: ReactPropsHitStatusDetailsTable = await getReactProps('HitStatusDetailsTable');

  el.querySelectorAll('.table-row').forEach((row, i) => {
    const hit = props.bodyData[i];

    row.querySelectorAll<HTMLElement>('.requester-name-column .expand-button').forEach((button) => {
      const react = document.createElement('span');

      button.style.display = 'none';
      button.parentElement.insertAdjacentElement('afterend', react);

      ReactDom.render(
        <Provider store={store}>
          <RequesterTurkerview requester_id={hit.requester_id} />
          <RequesterTurkopticon requester_id={hit.requester_id} />
        </Provider>,
        react,
      );
    });
  });
});
