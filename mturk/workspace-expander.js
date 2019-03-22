async function workspaceExpander() {
  const [options] = await Promise.all([
    StorageGetKey(`options`),
    Enabled(`workspaceExpander`),
  ]);
  
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

  const workspace = document.querySelector('#MainContent');
  const taskRow = document.querySelector('.task-row');
  const taskPreview = document.querySelector('.task-preview');
  const iframeContainer = document.querySelector('.task-row > .col-xs-12');
  const iframe = document.querySelector('.task-question-iframe-container');

  if (workspace) {
    workspace.style.height = `100vh`;
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
    iframeContainer.style.height = `100%`;
    iframeContainer.scrollIntoView();
  }

  if (iframe) {
    await sleep(500);
    iframe.style.height = `100%`;
    iframe.scrollIntoView();
    iframe.querySelector('iframe').focus();
  }

  const hr = document.querySelector('hr.footer-horizontal-rule');
  const div = document.querySelector('div.work-pipeline-bottom-bar');
  const footer = document.querySelector('footer');

  document.body.insertBefore(hr, footer);
  document.body.insertBefore(div, footer);

  if (options.hitDetailsSticky) {
    const detailBar = document.querySelector(`.project-detail-bar`);
    window.scrollBy(0, -Math.abs(detailBar.offsetHeight));
  }
}

workspaceExpander();
