/* globals storage */

function scriptEnabled () {
  const [script] = arguments

  return new Promise((resolve) => {
    (function checkStorage () {
      console.log(storage)
      if (storage && storage.scripts && storage.readyState === `complete`) {
        resolve(storage.scripts[script])
      } else {
        setTimeout(checkStorage, 1)
      }
    })()
  })
}
