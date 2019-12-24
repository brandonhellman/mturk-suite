import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import { AppState } from '../../store';
import { selectOptions } from '../../store/options/selectors';
import { getReactEl } from '../../utils/getReactEl';
import { getReactProps, ReactPropsHitSetTable } from '../../utils/getReactProps';

import { RequesterInfoButton } from './RequesterInfoButton';

const store = new Store<AppState>();

store.ready().then(async () => {
  const options = selectOptions(store.getState());

  if (!options.scripts.hitExporter) {
    return;
  }

  const el = await getReactEl('HitSetTable');
  const props: ReactPropsHitSetTable = await getReactProps('HitSetTable');

  el.querySelectorAll('.table-row').forEach((row, i) => {
    const hit = props.bodyData[i];

    row.querySelectorAll<HTMLElement>('.requester-column .expand-button').forEach((button) => {
      const react = document.createElement('react');

      button.style.display = 'none';
      button.parentElement.insertAdjacentElement('afterend', react);

      ReactDom.render(
        <Provider store={store}>
          <RequesterInfoButton />
        </Provider>,
        react,
      );
    });

    row.querySelectorAll('.project-name-column, .p-r-sm.requester-column > span').forEach((element: HTMLElement) => {
      const react = document.createElement('react');
      element.insertAdjacentElement('afterbegin', react);

      ReactDom.render(
        <Provider store={store}>
          <RequesterInfoButton />
        </Provider>,
        react,
      );
    });
  });
});
