async function autoAcceptChecker() {
  const [dom] = await Promise.all([
    ReactDOM(`AutoAcceptCheckbox`),
    Enabled(`autoAcceptChecker`)
  ]);

  const checkbox = dom.querySelector(`input:not(:checked)`).click();
  if (checkbox) checkbox.click();
}

autoAcceptChecker();
