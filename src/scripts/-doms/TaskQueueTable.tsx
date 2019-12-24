import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import { getReactEl } from '../../utils/getReactEl';
import { getReactProps, ReactPropsTaskQueueTable } from '../../utils/getReactProps';

import { HitScripts } from '../containers/HitScripts';
import { ReqScripts } from '../containers/ReqScripts';

const store = new Store();

store.ready().then(async () => {
  const el = await getReactEl('TaskQueueTable');
  const props: ReactPropsTaskQueueTable = await getReactProps('TaskQueueTable');

  el.querySelectorAll('.table-row').forEach((row, i) => {
    const hit = props.bodyData[i];

    row.querySelectorAll('.requester-column .expand-button').forEach((button: HTMLElement) => {
      const react = document.createElement('span');

      button.style.display = 'none';
      button.parentElement.insertAdjacentElement('afterend', react);

      ReactDom.render(
        // @ts-ignore
        <Provider store={store}>
          <ReqScripts requester_id={hit.project.requester_id} requester_name={hit.project.requester_name} />
        </Provider>,
        react,
      );
    });

    row.querySelectorAll('.project-name-column').forEach((element: HTMLElement) => {
      const react = document.createElement('span');
      element.insertAdjacentElement('afterbegin', react);

      const button: HTMLElement = element.querySelector('.expand-button');
      button.style.display = 'none';

      ReactDom.render(
        // @ts-ignore
        <Provider store={store}>
          <HitScripts />
        </Provider>,
        react,
      );
    });
  });
});
