const MTS_enabled = (value) =>
  new Promise((resolve) => chrome.storage.local.get(`options`, (result) => resolve(result.options[value])));

const MTS_element = (...selectors) =>
  new Promise((resolve, reject) => {
    const element = selectors.map((sel) => document.querySelector(`[data-react-class*="${sel}"]`)).find(Boolean);

    if (element) {
      window.requestAnimationFrame(() => resolve(element));
    } else {
      reject(new Error(`Unable to find "${selectors}".`));
    }
  });

const MTS_props = (...selectors) =>
  new Promise((resolve, reject) => {
    const element = selectors.map((sel) => document.querySelector(`[data-react-class*="${sel}"]`)).find(Boolean);

    if (element) {
      resolve(JSON.parse(element.dataset.reactProps));
    } else {
      reject(new Error(`Unable to find "${selectors}".`));
    }
  });

const MTS_elementAndProps = (...selectors) =>
  new Promise((resolve, reject) => {
    const element = selectors.map((sel) => document.querySelector(`[data-react-class*="${sel}"]`)).find(Boolean);

    if (element) {
      resolve([element, JSON.parse(element.dataset.reactProps)]);
    } else {
      reject(new Error(`Unable to find "${selectors}".`));
    }
  });

const MTS_sendMessage = (message) => new Promise((resolve) => chrome.runtime.sendMessage(message, resolve));
