async function WORKSPACE_EXPANDER() {
  const workspace =
    document.getElementsByClassName(`task-question-iframe-container`)[0] ||
    document.getElementById(`hit-wrapper`);
  workspace.style.height = `100vh`;
  workspace.children[0].focus();
  workspace.scrollIntoView();

  if ((await new Storage(`scripts`).value).hitDetailsSticky) {
    const detailBar = document.getElementsByClassName(`project-detail-bar`)[0];
    window.scrollBy(0, -Math.abs(detailBar.offsetHeight));
  }
}

new Script(WORKSPACE_EXPANDER, `workspaceExpander`).run();
