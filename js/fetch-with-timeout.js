// eslint-disable-next-line no-unused-vars
function Fetch(input, init, timeout) {
  return Promise.race([
    fetch(input, init),
    new Promise((resolve, reject) =>
      setTimeout(() => reject(new Error(`Fetch timeout.`)), timeout)
    )
  ]);
}
