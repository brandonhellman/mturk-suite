async function RATE_LIMIT_RELOADER() {
  const error = document.getElementsByClassName(`error-page`)[0];

  if (error && error.textContent.includes(`You have exceeded`)) {
    setTimeout(window.location.reload.bind(window.location), 1000);
  }
}

new Script(RATE_LIMIT_RELOADER, `rateLimitReloader`).run();
