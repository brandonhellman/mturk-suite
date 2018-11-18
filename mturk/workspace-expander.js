async function workspaceExpander() {
  const [options] = await Promise.all([
    StorageGetKey(`options`),
    Enabled(`workspaceExpander`)
  ]);

  const workspace = document.querySelector('#MainContent');
  workspace.style.height = `100vh`;
  workspace.children[0].focus();
  workspace.scrollIntoView();

  if (options.hitDetailsSticky) {
    const detailBar = document.querySelector(`.project-detail-bar`);
    window.scrollBy(0, -Math.abs(detailBar.offsetHeight));
  }
}

workspaceExpander();
