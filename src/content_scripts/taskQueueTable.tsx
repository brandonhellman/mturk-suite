import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import { getReactEl } from '../utils/getReactEl';
import { getReactProps, ReactPropsTaskQueueTable } from '../utils/getReactProps';

import ProjectShare from './components/ProjectShare';
import ProjetTurkerview from './components/ProjectTurkerview';
import RequesterInfo from './components/RequesterInfo';
import RequesterTurkerview from './components/RequesterTurkerview';
import RequesterTurkopticon from './components/RequesterTurkopticion';

const store = new Store();

store.ready().then(async () => {
  const el = await getReactEl('TaskQueueTable');
  const props: ReactPropsTaskQueueTable = await getReactProps('TaskQueueTable');

  el.querySelectorAll('.table-row').forEach((row, i) => {
    const project = props.bodyData[i].project;

    row.querySelectorAll<HTMLElement>('.requester-column .expand-button').forEach((button) => {
      const react = document.createElement('span');

      button.style.display = 'none';
      button.parentElement.insertAdjacentElement('afterend', react);

      ReactDom.render(
        <Provider store={store}>
          <RequesterTurkerview requester_id={project.requester_id} />
          <RequesterTurkopticon requester_id={project.requester_id} />
        </Provider>,
        react,
      );
    });

    row.querySelectorAll('.project-name-column').forEach((element: HTMLElement) => {
      const react = document.createElement('span');
      element.insertAdjacentElement('afterbegin', react);

      const button = element.querySelector<HTMLElement>('.expand-button');
      button.style.display = 'none';

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
