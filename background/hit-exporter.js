function hitExporterReviewDatabase() {
  return new Promise(resolve => {
    const request = window.indexedDB.open(`requesterReviewsDB`, 1);
    request.onsuccess = event => resolve(event.target.result);
  });
}

function hitExporterReviewsGet(id) {
  return new Promise(async resolve => {
    const database = await hitExporterReviewDatabase();
    const transaction = database.transaction([`requester`], `readonly`);
    const objectStore = transaction.objectStore(`requester`);
    const request = objectStore.get(id);
    request.onsuccess = event =>
      resolve(event.target.result ? event.target.result : null);
  });
}

function hitExporterCleanString(string) {
  return (
    string
      // Removes indents from string
      .replace(/\n\s+/g, `\r\n`)
  );
}

function bbCodeTemplateDirectModifier(template, message) {
  const { version } = chrome.runtime.getManifest();

  return encodeURIComponent(
    `${template}\n\n${message}`
      // Adds the "Exported from MTurk Suite v?.?.? to the provided template.
      .replace(
        `[/td][/tr][/table]`,
        `\n[tr][td][center][size=2]HIT exported from [url=http://mturksuite.com/]Mturk Suite[/url] v${version}[/size][/center][/td][/tr][/table]`
      )
      // Wraps each line with the <p> html element tag.
      .split(`\n`)
      .map(line => `<p>${line}</p>`)
      .join(`\n`)
  );
}

function hitToQualifications(hit) {
  const qual = o =>
    `${o.qualification_type.name} ${o.comparator} ${o.qualification_values.join(
      `, `
    )}`;
  const quals = hit.project_requirements.map(qual).join(`; `) || `None`;
  return quals;
}

function hitExporterNotification(title, body) {
  const notification = new Notification(title, {
    icon: `/media/icon_128.png`,
    body
  });
  window.setTimeout(notification.close.bind(notification), 7500);
}

function hitExporterToClipboard(exporter, string, hitId, sendResponse) {
  const cleaned = hitExporterCleanString(string);
  const textarea = document.createElement(`textarea`);
  textarea.textContent = cleaned;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand(`copy`);
  document.body.removeChild(textarea);
  hitExporterNotification(
    `HIT Export Successful!`,
    `${exporter} export has been copied to your clipboard.`
  );
  sendResponse({ success: true, id: hitId });
}

/*
* Requester Review Templates
*/

function templateTurkerView(review) {
  if (review instanceof Object === false) return `No Reviews`;

  const { ratings, rejections, tos, blocks } = review;
  const { hourly, pay, fast, comm } = ratings;

  return `[Hrly=$${hourly}] [Pay=${pay}] [Fast=${fast}] [Comm=${comm}] [Rej=${rejections}] [ToS=${tos}] [Blk=${blocks}]`;
}

function templateTurkopticon(review) {
  if (review instanceof Object === false) return `No Reviews`;

  const { attrs, reviews, tos_flags } = review;
  const { pay, fast, comm, fair } = attrs;

  // eslint-disable-next-line camelcase
  return `[Pay=${pay}] [Fast=${fast}] [Comm=${comm}] [Fair=${fair}] [Reviews=${reviews}] [ToS=${tos_flags}]`;
}

function templateTurkopticon2(review) {
  if (review instanceof Object === false) return `No Reviews`;

  const { all } = review;
  const { hourly, pending, comm, recommend, rejected, tos, broken } = all;

  return `[Hrly=${hourly}] [Pen=${pending}] [Res=${comm}] [Rec=${recommend}] [Rej=${rejected}] [ToS=${tos}] [Brk=${broken}]`;
}

/*
* Short Exporter Functions
*/

// Attempts to shorten URLs through Tjololo's https://ns4t.net/.
function shortTemplateURLs(hit) {
  const { requester_id, hit_set_id } = hit;

  const url = new URL(`https://ns4t.net/yourls-api.php`);
  const addParam = (name, value) => url.searchParams.append(name, value);
  addParam(`action`, `bulkshortener`);
  addParam(`title`, `MTurk`);
  addParam(`signature`, `39f6cf4959`);
  addParam(
    `urls[]`,
    `https://worker.mturk.com/requesters${requester_id}/projects`
  );
  addParam(`urls[]`, `https://worker.mturk.com/projects/${hit_set_id}/tasks`);
  addParam(
    `urls[]`,
    `https://worker.mturk.com/projects/${hit_set_id}/tasks/accept_random`
  );

  return new Promise(async resolve => {
    const response = await window.fetch(url);
    const text = await response.text();
    const urls = response.ok ? text.split(`;`) : null;
    resolve(urls);
  });
}

function shortTemplateMasters(hit) {
  const ids = [
    `2F1QJWKUDD8XADTFD2Q0G6UTO95ALH`,
    `2NDP2L92HECWY8NS8H3CK0CP5L9GHO`,
    `21VZU98JHSTLZ5BPP4A9NOBJEK3DPG`
  ];

  const includesIds = o => ids.includes(o.qualification_type_id).length;
  const hasMasters = hit.project_requirements.some(includesIds);
  const masters = hasMasters ? `MASTERS • ` : ``;
  return masters;
}

function shortTemplate(hit) {
  return new Promise(async resolve => {
    const { hit_set_id, requester_name, title, monetary_reward } = hit;
    const reward = `${monetary_reward.amount_in_dollars.toFixed(2)}`;
    const masters = shortTemplateMasters(hit);

    try {
      const urls = await shortTemplateURLs(hit);
      const [reqLink, prevLink, accLink] = urls;
      // eslint-disable-next-line camelcase
      const template = `${masters}${requester_name} ${reqLink} • ${title} ${prevLink} • ${reward} • Accept: ${accLink} • ${hit_set_id}`;
      resolve(template);
    } catch (error) {
      // eslint-disable-next-line camelcase
      const template = `${masters}${requester_name} • ${title} • ${reward} • Preview: https://worker.mturk.com/projects/${hit_set_id}/tasks • Accept: https://worker.mturk.com/projects/${hit_set_id}/tasks/accept_random`;
      resolve(template);
    }
  });
}

async function hitExporterShort(request, sender, sendResponse) {
  const template = await shortTemplate(request.hit);
  hitExporterToClipboard(`Short`, template, request, sender, sendResponse);
}

/*
* Plain Exporter Functions
*/

function plainTemplateTurkerView(hit, reviews) {
  const { requester_id } = hit;
  const template = templateTurkerView(reviews.turkerview);
  return `TV: ${template} • https://turkerview.com/requesters/${requester_id}\n`;
}

function plainTemplateTurkopticon(hit, reviews) {
  const { requester_id } = hit;
  const template = templateTurkopticon(reviews.turkopticon);
  return `TO ${template} • https://turkopticon.ucsd.edu/${requester_id}\n`;
}

function plainTemplateTurkopticon2(hit, reviews) {
  const { requester_id } = hit;
  const template = templateTurkopticon2(reviews.turkopticon2);
  return `TO2 ${template} • https://turkopticon.info/requesters/${requester_id}\n`;
}

function plainTemplateReviews(hit) {
  return new Promise(async resolve => {
    const [reviews, options] = await Promise.all([
      hitExporterReviewsGet(hit.requester_id),
      StorageGetKey(`options`)
    ]);

    if (options.requesterReviews) {
      const turkerview = options.requesterReviewsTurkerview
        ? plainTemplateTurkerView(hit, reviews)
        : ``;
      const turkopticon = options.requesterReviewsTurkopticon
        ? plainTemplateTurkopticon(hit, reviews)
        : ``;
      const turkopticon2 = options.requesterReviewsTurkopticon2
        ? plainTemplateTurkopticon2(hit, reviews)
        : ``;
      resolve(`${turkerview + turkopticon + turkopticon2}  `);
    } else {
      resolve(`  `);
    }
  });
}

function plainTemplate(hit) {
  return new Promise(async resolve => {
    const {
      assignable_hits_count,
      description,
      hit_set_id,
      requester_name,
      requester_id,
      title
    } = hit;
    const reviews = await plainTemplateReviews(hit);
    const reward = `${hit.monetary_reward.amount_in_dollars.toFixed(2)}`;
    const duration = hit.assignment_duration_in_seconds;
    const qualifications = hitToQualifications(hit);

    const template = `Title: ${title} • https://worker.mturk.com/projects/${hit_set_id}/tasks • https://worker.mturk.com/projects/${hit_set_id}/tasks/accept_random
      Requester: ${requester_name} • https://worker.mturk.com/requesters${requester_id}/projects
      ${reviews}
      Reward: ${reward}
      Duration: ${duration}
      Available: ${assignable_hits_count}
      Description: ${description}
      Qualifications: ${qualifications}`;

    resolve(template);
  });
}

async function hitExporterPlain(request, sender, sendResponse) {
  const template = await plainTemplate(request.hit);
  hitExporterToClipboard(`Plain`, template, sendResponse);
}

/*
* BBCode Exporter Functions
*/

function bbCodeTemplateTurkerView(hit, reviews) {
  const { requester_id } = hit;
  const template = templateTurkerView(reviews.turkerview);
  return `[b][url=https://turkerview.com/requesters/${requester_id}]TV[/url]:[/b] ${template}\n`;
}

function bbCodeTemplateTurkopticon(hit, reviews) {
  const { requester_id } = hit;
  const template = templateTurkopticon(reviews.turkopticon);
  return `[b][url=https://turkopticon.ucsd.edu/${requester_id}]TO[/url]:[/b] ${template}\n`;
}

function bbCodeTemplateTurkopticon2(hit, reviews) {
  const { requester_id } = hit;
  const template = templateTurkopticon2(reviews.turkopticon2);
  return `[b][url=https://turkopticon.info/requesters/${requester_id}]TO2[/url]:[/b] ${template}\n`;
}

function bbCodeTemplateReviews(hit) {
  return new Promise(async resolve => {
    const [reviews, options] = await Promise.all([
      hitExporterReviewsGet(hit.requester_id),
      StorageGetKey(`options`)
    ]);

    if (options.requesterReviews) {
      const turkerview = options.requesterReviewsTurkerview
        ? bbCodeTemplateTurkerView(hit, reviews)
        : ``;
      const turkopticon = options.requesterReviewsTurkopticon
        ? bbCodeTemplateTurkopticon(hit, reviews)
        : ``;
      const turkopticon2 = options.requesterReviewsTurkopticon2
        ? bbCodeTemplateTurkopticon2(hit, reviews)
        : ``;
      resolve(turkerview + turkopticon + turkopticon2);
    } else {
      resolve(`  `);
    }
  });
}

function bbCodeTemplate(hit) {
  return new Promise(async resolve => {
    const {
      assignable_hits_count,
      description,
      hit_set_id,
      requester_name,
      requester_id,
      title
    } = hit;
    const reviews = await bbCodeTemplateReviews(hit);
    const reward = `${hit.monetary_reward.amount_in_dollars.toFixed(2)}`;
    const duration = hit.assignment_duration_in_seconds;
    const qualifications = hitToQualifications(hit);

    const template = `[table][tr][td][b]Title:[/b] [url="https://worker.mturk.com/projects/${hit_set_id}/tasks"]${title}[/url] | [url="https://worker.mturk.com/projects/${hit_set_id}/tasks/accept_random"]Accept[/url]
      [b]Requester:[/b] [url="https://worker.mturk.com/requesters/${requester_id}/projects"]${requester_name}[/url] [${requester_id}] [url="https://worker.mturk.com/contact_requester/hit_type_messages/new?hit_type_message[hit_type_id]=YOURMTURKHIT&hit_type_message[requester_id]=${requester_id}"]Contact[/url]
      ${reviews}[b]Reward:[/b] ${reward}
      [b]Duration:[/b] ${duration}
      [b]Available:[/b] ${assignable_hits_count}
      [b]Description:[/b] ${description}
      [b]Qualifications:[/b] ${qualifications}[/td][/tr][/table]`;
    resolve(template);
  });
}

async function hitExporterBBCode(request, sender, sendResponse) {
  const template = await bbCodeTemplate(request.hit);
  hitExporterToClipboard(`BBCode`, template, request, sender, sendResponse);
}

/*
* Markdown Exporter Functions
*/

function markdownTemplateTurkerView(hit, reviews) {
  const { requester_id } = hit;
  const template = templateTurkerView(reviews.turkerview);
  return `**[TV](https://turkerview.com/requesters/${requester_id}):** ${template}  \n`;
}

function markdownTemplateTurkopticon(hit, reviews) {
  const { requester_id } = hit;
  const template = templateTurkopticon(reviews.turkopticon);
  return `**[TO](https://turkopticon.ucsd.edu/${requester_id}):** ${template}  \n`;
}

function markdownTemplateTurkopticon2(hit, reviews) {
  const { requester_id } = hit;
  const template = templateTurkopticon2(reviews.turkopticon2);
  return `**[TO2](https://turkopticon.info/requesters/${requester_id}):** ${template}  \n`;
}

function markdownTemplateReviews(hit) {
  return new Promise(async resolve => {
    const [reviews, options] = await Promise.all([
      hitExporterReviewsGet(hit.requester_id),
      StorageGetKey(`options`)
    ]);

    if (options.requesterReviews) {
      const turkerview = options.requesterReviewsTurkerview
        ? markdownTemplateTurkerView(hit, reviews)
        : ``;
      const turkopticon = options.requesterReviewsTurkopticon
        ? markdownTemplateTurkopticon(hit, reviews)
        : ``;
      const turkopticon2 = options.requesterReviewsTurkopticon2
        ? markdownTemplateTurkopticon2(hit, reviews)
        : ``;
      resolve(`${turkerview + turkopticon + turkopticon2}  `);
    } else {
      resolve(`  `);
    }
  });
}

function markdownTemplate(hit) {
  return new Promise(async resolve => {
    const template = `> **Title:** [${
      hit.title
    }](https://worker.mturk.com/projects/${
      hit.hit_set_id
    }/tasks) | [Accept](https://worker.mturk.com/projects/${
      hit.hit_set_id
    }/tasks/accept_random)  
      **Requester:** [${
        hit.requester_name
      }](https://worker.mturk.com/requesters${hit.requester_id}/projects) [${
      hit.requester_id
    }] [Contact](https://worker.mturk.com/contact_requester/hit_type_messages/new?hit_type_message[hit_type_id]=YOURMTURKHIT&hit_type_message[requester_id]=${
      hit.requester_id
    })  
      ${await markdownTemplateReviews(hit)}**Reward:** $${
      hit.monetary_reward.amount_in_dollars
    }  
      **Duration:** ${hit.assignment_duration_in_seconds}  
      **Available:** ${hit.assignable_hits_count}  
      **Description:** ${hit.description}  
      **Qualifications:** ${hit.project_requirements
        .map(o =>
          `${o.qualification_type.name} ${
            o.comparator
          } ${o.qualification_values.map(v => v).join(`, `)}`.trim()
        )
        .join(`; `) || `None`}`;
    resolve(template);
  });
}

async function hitExporterMarkdown(request, sender, sendResponse) {
  const template = await markdownTemplate(request.hit);
  hitExporterToClipboard(`Markdown`, template, request, sender, sendResponse);
}

/*
* Turker Hub Exporter Functions
*/

function turkerHubFetchDaily() {
  return new Promise(async (resolve, reject) => {
    const response = await window.fetch(
      `https://turkerhub.com/forums/daily-mturk-hits-threads.2/?order=post_date&direction=desc`,
      {
        credentials: `include`
      }
    );

    if (response.ok) {
      const doc = new DOMParser().parseFromString(
        await response.text(),
        `text/html`
      );
      const xfToken = doc.getElementsByName(`_xfToken`);

      if (xfToken.length > 0 && xfToken[0].value.length > 0) {
        const newestThread = Math.max(
          ...[...doc.querySelectorAll(`li[id^="thread-"]`)].map(el =>
            Number(el.id.replace(/[^0-9.]/g, ``))
          )
        );
        resolve({ token: xfToken, thread: newestThread });
      } else {
        reject(new Error(`Not logged in.`));
      }
    } else {
      reject(new Error(`Failed to fetch daily thread.`));
    }
  });
}

function turkerHubCheckPosts(hit, thread) {
  return new Promise(async (resolve, reject) => {
    const response = await window.fetch(
      `https://turkerhub.com/hub.php?action=getPosts&thread_id=${thread}&order_by=post_date`,
      {
        credentials: `include`
      }
    );

    if (response.ok) {
      const json = await response.json();

      json.posts.forEach(post => {
        if (post.message.indexOf(hit.hit_set_id)) {
          throw new Error(`HIT was recently posted`);
        }
      });

      resolve();
    } else {
      reject(new Error(`Failed to check against recent posts.`));
    }
  });
}

function turkerHubPostExport(thread, token, string) {
  return new Promise(async (resolve, reject) => {
    const response = await window.fetch(
      `https://turkerhub.com/threads/${thread}/add-reply`,
      {
        credentials: `include`,
        method: `post`,
        body: new URLSearchParams(
          `_xfToken=${token[0].value}&message_html=${string}`
        )
      }
    );

    if (response.ok) {
      resolve();
    } else {
      reject(new Error(`Failed to post export.`));
    }
  });
}

async function hitExporterTurkerHub(request, sender, sendResponse) {
  try {
    const data = await turkerHubFetchDaily();
    await turkerHubCheckPosts(request.hit, data.thread);
    const template = await bbCodeTemplate(request.hit);
    const modified = bbCodeTemplateDirectModifier(template, request.message);
    await turkerHubPostExport(data.thread, data.token, modified);
    hitExporterNotification(
      `HIT Exporter Successful!`,
      `Turker Hub export posted on TurkerHub.com`
    );
    sendResponse({ success: true, id: request.hit.hit_set_id });
  } catch (error) {
    hitExporterNotification(
      `HIT Exporter Failed!`,
      `Turker Hub export failed with the error ${error}`
    );
    sendResponse({ success: false, id: request.hit.hit_set_id });
  }
}

/*
* MTurk Crowd Exporter Functions
*/

function mturkCrowdFetchDaily() {
  return new Promise(async (resolve, reject) => {
    const response = await window.fetch(
      `https://www.mturkcrowd.com/forums/4/?order=post_date&direction=desc`,
      {
        credentials: `include`
      }
    );

    if (response.ok) {
      const doc = new DOMParser().parseFromString(
        await response.text(),
        `text/html`
      );
      const xfToken = doc.getElementsByName(`_xfToken`);

      if (xfToken.length > 0 && xfToken[0].value.length > 0) {
        const newestThread = Math.max(
          ...[...doc.querySelectorAll(`li[id^="thread-"]`)].map(el =>
            Number(el.id.replace(/[^0-9.]/g, ``))
          )
        );
        resolve({ token: xfToken, thread: newestThread });
      } else {
        reject(new Error(`Not logged in.`));
      }
    } else {
      reject(new Error(`Failed to fetch daily thread.`));
    }
  });
}

function mturkCrowdCheckPosts(hit, thread) {
  return new Promise(async (resolve, reject) => {
    const response = await window.fetch(
      `https://www.mturkcrowd.com/api.php?action=getPosts&thread_id=${thread}&order_by=post_date`,
      {
        credentials: `include`
      }
    );

    if (response.ok) {
      const json = await response.json();

      json.posts.forEach(post => {
        if (post.message.indexOf(hit.hit_set_id)) {
          throw new Error(`HIT was recently posted`);
        }
      });

      resolve();
    } else {
      reject(new Error(`Failed to check against recent posts.`));
    }
  });
}

function mturkCrowdPostExport(thread, token, string) {
  return new Promise(async (resolve, reject) => {
    const response = await window.fetch(
      `https://www.mturkcrowd.com/threads/${thread}/add-reply`,
      {
        credentials: `include`,
        method: `post`,
        body: new URLSearchParams(
          `_xfToken=${token[0].value}&message_html=${string}`
        )
      }
    );

    if (response.ok) {
      resolve();
    } else {
      reject(new Error(`Failed to post export.`));
    }
  });
}

async function hitExporterMturkCrowd(request, sender, sendResponse) {
  try {
    const data = await mturkCrowdFetchDaily();
    await mturkCrowdCheckPosts(request.hit, data.thread);
    const template = await bbCodeTemplate(request.hit);
    const modified = bbCodeTemplateDirectModifier(template, request.message);
    await mturkCrowdPostExport(data.thread, data.token, modified);
    hitExporterNotification(
      `HIT Export Successful!`,
      `MTurk Crowd export posted on MTurkCrowd.com`
    );
    sendResponse({ success: true, id: request.hit.hit_set_id });
  } catch (error) {
    hitExporterNotification(
      `HIT Export Failed!`,
      `MTurk Crowd export failed with the error ${error}`
    );
    sendResponse({ success: false, id: request.hit.hit_set_id });
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { hitExporter } = request;

  if (hitExporter) {
    if (hitExporter === `short`)
      hitExporterShort(request, sender, sendResponse);
    if (hitExporter === `plain`)
      hitExporterPlain(request, sender, sendResponse);
    if (hitExporter === `bbcode`)
      hitExporterBBCode(request, sender, sendResponse);
    if (hitExporter === `markdown`)
      hitExporterMarkdown(request, sender, sendResponse);
    if (hitExporter === `turkerhub`)
      hitExporterTurkerHub(request, sender, sendResponse);
    if (hitExporter === `mturkcrowd`)
      hitExporterMturkCrowd(request, sender, sendResponse);
    return true;
  }

  return false;
});
