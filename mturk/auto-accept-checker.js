async function AUTO_ACCEPT_CHECKER() {
  const element = await new React(`AutoAcceptCheckbox`).element;
  const checkbox = element.getElementsByTagName(`input`)[0];

  if (!checkbox.checked) {
    checkbox.click();
  }
}

new Script(`autoAcceptChecker`, AUTO_ACCEPT_CHECKER).run();
