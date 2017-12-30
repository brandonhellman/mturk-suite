(async () => {
    await ready({ enabled: `workspaceExpander`, document: `interactive` });

    const workspace = document.getElementsByClassName(`task-question-iframe-container`)[0];
    workspace.style.height = `100vh`;
    workspace.children[0].focus();
    workspace.scrollIntoView();
})();