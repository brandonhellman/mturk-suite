import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import { getReactEl } from '../utils/getReactEl';
import { getReactProps, ReactPropsHitSetTable } from '../utils/getReactProps';

import ProjectShare from './components/ProjectShare';
import ProjetTurkerview from './components/ProjectTurkerview';
import RequesterInfo from './components/RequesterInfo';
import RequesterTurkerview from './components/RequesterTurkerview';
import RequesterTurkopticon from './components/RequesterTurkopticion';

const store = new Store();

store.ready().then(async () => {
  const el = await getReactEl('HitSetTable');
  const props: ReactPropsHitSetTable = await getReactProps('HitSetTable');

  el.querySelectorAll('.table-row').forEach((row, i) => {
    const project = props.bodyData[i];

    row.querySelectorAll<HTMLElement>('.requester-column .expand-button').forEach((button) => {
      const react = document.createElement('span');

      button.style.display = 'none';
      button.parentElement.insertAdjacentElement('afterend', react);

      ReactDom.render(
        <Provider store={store}>
          <RequesterTurkerview requester_id={project.requester_id} />
          <RequesterTurkopticon requester_id={project.requester_id} />
          <RequesterInfo requester_id={project.requester_id} requesterInfo={project.requesterInfo} />
        </Provider>,
        react,
      );
    });

    row.querySelectorAll('.project-name-column, .p-r-sm.requester-column > span').forEach((element) => {
      const react = document.createElement('span');
      element.insertAdjacentElement('afterbegin', react);

      ReactDom.render(
        <Provider store={store}>
          <ProjetTurkerview hit_set_id={project.hit_set_id} />
          <ProjectShare hit_set_id={project.hit_set_id} />
        </Provider>,
        react,
      );
    });
  });
});
