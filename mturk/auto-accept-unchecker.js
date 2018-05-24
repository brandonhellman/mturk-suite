async function autoAcceptUnchecker() {
  const [dom] = await Promise.all([
    ReactDOM(`AutoAcceptCheckbox`),
    Enabled(`autoAcceptUnchecker`)
  ]);

  const checkbox = dom.querySelector(`input:checked`).click();
  if (checkbox) checkbox.click();
}

autoAcceptUnchecker();
