import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import { getReactEl } from '../../utils/getReactEl';
import { getReactProps, ReactPropsHitStatusDetailsTable } from '../../utils/getReactProps';

import { ReqScripts } from '../containers/ReqScripts';

const store = new Store();

store.ready().then(async () => {
  const el = await getReactEl('HitStatusDetailsTable');
  const props: ReactPropsHitStatusDetailsTable = await getReactProps('HitStatusDetailsTable');

  el.querySelectorAll('.table-row').forEach((row, i) => {
    const hit = props.bodyData[i];

    row.querySelectorAll('.requester-name-column .expand-button').forEach((button: HTMLElement) => {
      const react = document.createElement('span');

      button.style.display = 'none';
      button.parentElement.insertAdjacentElement('afterend', react);

      ReactDom.render(
        // @ts-ignore
        <Provider store={store}>
          <ReqScripts requester_id={hit.requester_id} requester_name={hit.requester_name} />
        </Provider>,
        react,
      );
    });
  });
});
