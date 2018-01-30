function mturkReact () {
  const [selector] = arguments

  return new Promise(async (resolve, reject) => {
    await waitForReadyState(`interactive`)

    const element = document.querySelector(`[data-react-class^="require('${selector}')"]`)

    if (element) {
      resolve({
        getProps () {
          return new Promise((resolve) => {
            const props = JSON.parse(element.dataset.reactProps)
            resolve(props)
          })
        },
        getElement () {
          return new Promise(async (resolve) => {
            await waitForReadyState(`complete`)
            resolve(element)
          })
        }
      })
    } else {
      resolve(false)
    }
  })

  function waitForReadyState () {
    const [readyState] = arguments

    return new Promise((resolve) => {
      if (document.readyState === readyState || document.readyState === `complete`) {
        resolve()
      } else {
        document.addEventListener(`readystatechange`, (event) => {
          if (event.target.readyState === readyState) {
            resolve()
          }
        })
      }
    })
  }
}
