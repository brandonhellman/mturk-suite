function ReadyState(state) {
  return new Promise(async resolve => {
    if (document.readyState === state || document.readyState === `complete`) {
      resolve();
    } else {
      document.addEventListener(`readystatechange`, event => {
        if (event.target.readyState === state) {
          resolve();
        }
      });
    }
  });
}

class Storage {
  constructor(key) {
    this.key = key;
  }

  get value() {
    return new Promise(async resolve =>
      chrome.storage.local.get(this.key, key => {
        resolve(key[this.key]);
      })
    );
  }
}

// eslint-disable-next-line no-unused-vars
class Script extends Storage {
  constructor(func, name) {
    super(`scripts`);
    this.func = func;
    this.name = name;
  }

  get enabled() {
    return new Promise(async resolve => {
      if (this.name) {
        resolve((await this.value)[this.name]);
      } else {
        resolve(true);
      }
    });
  }

  async run() {
    if (await this.enabled) {
      this.func();
    }
  }
}

// eslint-disable-next-line no-unused-vars
class React {
  constructor(selector) {
    this.selector = selector;
  }

  get el() {
    return document.querySelector(`[data-react-class*="${this.selector}"][data-react-props]`);
  }

  get element() {
    return new Promise(async resolve => {
      await ReadyState(`complete`);
      resolve(this.el);
    });
  }

  get dom() {
    return new Promise(async resolve => {
      await ReadyState(`complete`);
      resolve(this.el);
    });
  }

  get props() {
    return new Promise(async resolve => {
      await ReadyState(`interactive`);
      resolve(this.el ? JSON.parse(this.el.dataset.reactProps) : null);
    });
  }
}
