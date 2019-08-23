import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import { selectOptions } from '../../store/options/selectors';
import { getReactEl } from '../../utils/getReactEl';
import { getReactProps, ReactPropsHitSetTable } from '../../utils/getReactProps';

import { Turkerview } from '../components/Turkerview';
import { Turkopticon } from '../components/Turkopticon';

const store = new Store();

store.ready().then(async () => {
  const options = selectOptions(store.getState());
  const el = await getReactEl('HitSetTable');
  const props: ReactPropsHitSetTable = await getReactProps('HitSetTable');

  el.querySelectorAll('.table-row').forEach((row, i) => {
    const hit = props.bodyData[i];

    row.querySelectorAll('.requester-column .expand-button').forEach((button: HTMLElement) => {
      const react = document.createElement('span');

      button.style.display = 'none';
      button.parentElement.insertAdjacentElement('afterend', react);

      ReactDom.render(
        // @ts-ignore
        <Provider store={store}>
          {options.scripts.turkerview && <Turkerview rid={hit.requester_id} rname={hit.requester_name} />}
          {options.scripts.turkopticon && <Turkopticon rid={hit.requester_id} rname={hit.requester_name} />}
        </Provider>,
        react,
      );
    });
  });
});
