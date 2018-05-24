async function confirmReturnHIT() {
  await Enabled(`confirmReturnHIT`);

  document.addEventListener(`submit`, event => {
    if (event.target.querySelector(`[value="delete"]`)) {
      event.preventDefault();

      // eslint-disable-next-line no-alert
      if (window.confirm(`Are you sure you want to return this HIT?`)) {
        event.target.submit();
      }
    }
  });
}

confirmReturnHIT();
