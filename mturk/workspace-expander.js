async function workspaceExpander() {
  const [options] = await Promise.all([
    StorageGetKey(`options`),
    Enabled(`workspaceExpander`)
  ]);

  const workspace = document.querySelector('#MainContent');
  const iframe = document.querySelector('.task-question-iframe-container');

  if (workspace) {
    workspace.style.height = `100vh`;
    workspace.scrollIntoView();
  }

  if (iframe) {
    iframe.style.height = `100vh`;
    iframe.scrollIntoView();
    iframe.querySelector('iframe').focus();
  }

  if (options.hitDetailsSticky) {
    const detailBar = document.querySelector(`.project-detail-bar`);
    window.scrollBy(0, -Math.abs(detailBar.offsetHeight));
  }
}

workspaceExpander();
