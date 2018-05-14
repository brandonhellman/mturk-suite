// eslint-disable-next-line no-unused-vars
function ReactDOM(...selectors) {
  return new Promise(async (resolve, reject) => {
    const dom = selectors
      .map(sel => document.querySelector(`[data-react-class*="${sel}"]`))
      .find(Boolean);

    if (dom) {
      window.requestAnimationFrame(() => {
        resolve(dom);
      });
    } else {
      reject(new Error(`Unable to find "${selectors}".`));
    }
  });
}

// eslint-disable-next-line no-unused-vars
async function ReactProps(...selectors) {
  return new Promise(async (resolve, reject) => {
    const dom = selectors
      .map(sel => document.querySelector(`[data-react-class*="${sel}"]`))
      .find(Boolean);

    if (dom) {
      resolve(JSON.parse(dom.dataset.reactProps));
    } else {
      reject(new Error(`Unable to find "${selectors}".`));
    }
  });
}
