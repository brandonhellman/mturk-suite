chrome.storage.local.get(`options`, keys => {
  const { options } = keys;
  window.console.log(options);
});

/*
const storage = {
  blockList() {
    const [object] = arguments,
      template = {};

    for (const key in object) {
      const prop = object[key];

      if (prop.match) {
        template[prop.match] = {
          name: prop.name || prop.match,
          match: prop.match,
          strict: typeof prop.strict === `boolean` ? prop.strict : true
        };
      }
    }

    storage.blockList = template;
  },

  includeList() {
    const [object] = arguments,
      template = {};

    for (const key in object) {
      const prop = object[key];

      if (prop.match) {
        template[prop.match] = {
          name: prop.name || prop.match,
          match: prop.match,
          strict: typeof prop.strict === `boolean` ? prop.strict : true,
          sound: typeof prop.sound === `boolean` ? prop.sound : true,
          alarm: typeof prop.alarm === `boolean` ? prop.alarm : false,
          pushbullet:
            typeof prop.pushbullet === `boolean` ? prop.pushbullet : false,
          notification:
            typeof prop.notification === `boolean` ? prop.notification : true
        };
      }
    }

    storage.includeList = template;
  },

  exports() {
    const [string] = arguments,
      template = `all`;

    storage.exports = [
      `all`,
      `short`,
      `plain`,
      `bbcode`,
      `markdown`,
      `turkerhub`,
      `mturkcrowd`
    ].includes(string)
      ? string
      : template;
  },

  hitFinder() {
    const [object] = arguments,
      template = {
        speed: `3000`,

        "filter-search-term": ``,
        "filter-sort": `updated_desc`,
        "filter-page-size": `25`,
        "filter-masters": false,
        "filter-qualified": false,
        "filter-min-reward": `0`,
        "filter-min-available": `0`,
        "filter-min-requester-rating": `0`,

        "alert-new-sound": `sound-1`,
        "alert-include-delay": `30`,
        "alert-include-sound": `voice`,
        "alert-pushbullet-state": `off`,
        "alert-pushbullet-token": ``,

        "display-colored-rows": true,

        "display-recent-column-time": false,
        "display-recent-column-requester": true,
        "display-recent-column-title": true,
        "display-recent-column-available": true,
        "display-recent-column-reward": true,
        "display-recent-column-masters": true,

        "display-logged-column-time": true,
        "display-logged-column-requester": true,
        "display-logged-column-title": true,
        "display-logged-column-available": true,
        "display-logged-column-reward": true,
        "display-logged-column-masters": true,

        "display-included-column-time": true,
        "display-included-column-requester": true,
        "display-included-column-title": true,
        "display-included-column-available": true,
        "display-included-column-reward": true,
        "display-included-column-masters": true
      };

    for (const prop in template) {
      if (
        object !== undefined &&
        object[prop] !== undefined &&
        typeof object[prop] === typeof template[prop]
      ) {
        template[prop] = object[prop];
      }
    }

    storage.hitFinder = template;
  },

  reviews() {
    const [object] = arguments,
      template = {
        turkerview: true,
        turkopticon: true,
        turkopticon2: true
      };

    for (const prop in template) {
      if (
        object !== undefined &&
        object[prop] !== undefined &&
        typeof object[prop] === typeof template[prop]
      ) {
        template[prop] = object[prop];
      }
    }

    storage.reviews = template;
  },

  scripts() {
    const [object] = arguments,
      template = {
        autoAcceptChecker: true,
        blockListOnMturk: true,
        confirmReturnHIT: true,
        dashboardEnhancer: true,
        hitExporter: true,
        hitTracker: true,
        hitDetailsSticky: true,
        paginationLastPage: true,
        queueInfoEnhancer: true,
        rateLimitReloader: true,
        rememberFilter: true,
        requesterReviews: true,
        workspaceExpander: true
      };

    for (const prop in template) {
      if (
        object !== undefined &&
        object[prop] !== undefined &&
        typeof object[prop] === typeof template[prop]
      ) {
        template[prop] = object[prop];
      }
    }

    storage.scripts = template;
  },

  themes() {
    const [object] = arguments,
      template = {
        mts: `default`,
        mturk: `default`
      };

    for (const prop in template) {
      if (
        object !== undefined &&
        object[prop] !== undefined &&
        typeof object[prop] === typeof template[prop]
      ) {
        template[prop] = object[prop];
      }
    }

    storage.themes = template;
  },

  version() {
    const [string] = arguments,
      template = chrome.runtime.getManifest().version;

    if (string !== template) {
      chrome.tabs.create({
        url: `/change_log/change_log.html`
      });
    }

    storage.version = template;
  }
};

chrome.storage.local.get(null, keys => {
  for (const prop in keys) {
    if (storage[prop] && typeof storage[prop] === `function`) {
      storage[prop](keys[prop]);
    }
  }

  for (const prop in storage) {
    if (typeof storage[prop] === `function`) {
      storage[prop]();
    }

    chrome.storage.local.set({
      [prop]: storage[prop]
    });
  }
});

chrome.storage.onChanged.addListener(changes => {
  for (const value of [`reviews`, `scripts`, `workerId`]) {
    if (changes[value] !== undefined) {
      storage[value] = changes[value].newValue;
    }
  }
});
*/
