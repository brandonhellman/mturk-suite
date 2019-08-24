import { Store } from 'webext-redux';

import { selectOptions } from '../store/options/selectors';
import { sleep } from '../utils/sleep';

const store = new Store();

store.ready().then(async () => {
  const options = selectOptions(store.getState());

  if (!options.scripts.workspaceExpander) {
    return;
  }

  const workspace: HTMLElement = document.querySelector('#MainContent');
  const taskRow: HTMLElement = document.querySelector('.task-row');
  const taskPreview: HTMLElement = document.querySelector('.task-preview');
  const iframeContainer: HTMLElement = document.querySelector('.task-row > .col-xs-12');
  const iframe: HTMLElement = document.querySelector('.task-question-iframe-container');

  if (workspace) {
    workspace.style.height = '100vh';
    workspace.scrollIntoView();
  }

  if (taskRow) {
    taskRow.style.height = '100vh';
    taskRow.scrollIntoView();
  }

  if (taskPreview) {
    taskPreview.style.height = '100%';
    taskPreview.scrollIntoView();
  }

  if (iframeContainer) {
    iframeContainer.style.height = '100%';
    iframeContainer.scrollIntoView();
  }

  if (iframe) {
    await sleep(100);
    iframe.style.height = '100%';
    iframe.scrollIntoView();
    iframe.querySelector('iframe').focus();
  }

  const hr = document.querySelector('hr.footer-horizontal-rule');
  const div = document.querySelector('div.work-pipeline-bottom-bar');
  const footer = document.querySelector('footer');

  document.body.insertBefore(hr, footer);
  document.body.insertBefore(div, footer);
});
