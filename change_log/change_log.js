const changeLog = [];

changeLog.push({
  version: `2.3.10`,
  date: `Sunday, September 8, 2018`,
  "New Feature: Block Location": [
    'Block HITs that you do not meet the location qualification for.',
  ],
  "HIT Catcher": [
    "Fix: Should announce when logged out again.",
  ],
  "General": [
    "Cache TTS voice."
  ]
});

changeLog.push({
  version: `2.3.9`,
  date: `Tuesday, August 28, 2018`,
  "HIT Catcher": [
    'Avoid selecting the voice for Text to Speech unnecessarily',
    'Avoid parsing for infomation about a HIT if we already got it.'
  ]
});


changeLog.push({
  version: `2.3.8`,
  date: `Wednesday, August 22, 2018`,
  "General": [
    'Firefox: Fix for pending earnings link trying to go to a Chrome URL.'
  ]
});


changeLog.push({
  version: `2.3.7`,
  date: `Sunday, July 1, 2018`,
  "HIT Tracker": [
    'Week ranges are no longer hardcoded and will no longer require updates to fix.'
  ]
});

changeLog.push({
  version: `2.3.6`,
  date: `Thursday, May 31, 2018`,
  General: [
    `HIT Catcher buttons for missed HITs now have a fallback for slower load times fixing issues where they would not show up for some.`
  ]
});

changeLog.push({
  version: `2.3.5`,
  date: `Tuesday, May 29, 2018`,
  General: [
    `Block List On MTurk now works on requester pages.`
  ]
});

changeLog.push({
  version: `2.3.4`,
  date: `Monday, May 28, 2018`,
  General: [
    `Input Worker Id working again for Firefox`,
    `HIT Tracker earnings are updating live corretly again.`
  ]
});

changeLog.push({
  version: `2.3.3`,
  date: `Monday, May 28, 2018`,
  General: [
    `HIT Catcher buttons for missed HITs should be fixed for everyone`
  ],
  "HIT Finder": [`Fixed issue when an Include List match was found with notifications enabled causing Finder to stall.`]
});

changeLog.push({
  version: `2.3.2`,
  date: `Monday, May 28, 2018`,
  "HIT Finder": [`Requester reviews are now updating again.`]
});

changeLog.push({
  version: `2.3.1`,
  date: `Sunday, May 27, 2018`,
  General: [
    `Fixed HIT Tracker Live Update, will now properly update when you submit or sync.`,
    `HIT Catcher Once and Panda buttons when you miss a HIT are back from vacation.`,
    `Remember Filter fixed.`,
    `Pagination Last Page now always links to the correct page.`
  ]
});

changeLog.push({
  version: `2.3`,
  date: `Sunday, May 27, 2018`,
  MTS: [
    `Options have been RESET!`,
    `New toggles for HIT Tracker stuff on MTurk.`,
    `Right clicking the icon now has links to launch Finder, Catcher and Tracker.`
  ],
  General: [
    `Auto Accept Checker removed. MTurk's new default is alway checked.`,
    `Auto Accept Unchecker added.`,
    `Requester Review icon changed.`,
    `HIT Exporter icon changed.`,
    `HIT Tracker icons for no work found have been removed.`,
    `Popovers now have a 500ms activation time instead of instant.`,
    `HIT Exporter changed from modal to popover.`,
    `You can now view and edit your Block List directly on MTurk`
  ],
  "HIT Tracker": [`Weekly range for June done.`]
});

changeLog.push({
  version: `2.2.3`,
  date: `Sunday, April 8, 2018`,
  General: [
    `HIT Exporter should no longer break on direct exports if there is a special character on the export.`,
    `HIT Exporter Direct export options now have the option to leave a message along with the `,
    `HIT Exporter contact links now properly link to the correct constact requester URL.`
  ]
});

changeLog.push({
  version: `2.2.3`,
  date: `Sunday, April 8, 2018`,
  "HIT Finder": [`Fix for notifications not showing in Firefox.`]
});

changeLog.push({
  version: `2.2.2`,
  date: `Tuesday, April 2, 2018`,
  "HIT Finder": [`MTC Direct Export working again.`]
});

changeLog.push({
  version: `2.2.1`,
  date: `Tuesday, April 2, 2018`,
  "HIT Finder": [`HIT Exports working again.`]
});

changeLog.push({
  version: `2.2.0`,
  date: `Saturday, March 31, 2018`,
  General: [
    `Updates will now trigger a desktop notification.`,
    `Input Worker ID now working properly on all frames.`
  ],
  "HIT Tracker": [
    `All of April's 2018 weekly ranges hardcoded while a permanent solution is being made.`,
    `Sundays will now show Projected Earnings Last Week`
  ]
});

changeLog.push({
  version: `2.1.19`,
  "HIT Tracker": [`Week range updated.`]
});

changeLog.push({
  version: `2.1.18`,
  "HIT Tracker": [`Week range updated.`]
});

changeLog.push({
  version: `2.1.17`,
  date: `Monday, March 12, 2018`,
  "HIT Tracker": [`Week range updated.`]
});

changeLog.push({
  version: `2.1.16`,
  date: `Thursday, March 8, 2018`,
  "HIT Tracker": [
    `Fixed backup import issue (re-import to fix if you imported a backup on v2.1.15).`
  ]
});

changeLog.forEach(changes => {
  const card = document.createElement(`div`);
  card.className = `card mt-1`;

  const header = document.createElement(`div`);
  header.className = `card-header bg-primary text-white`;
  card.appendChild(header);

  const version = document.createElement(`span`);
  version.textContent = changes.version;
  header.appendChild(version);

  const date = document.createElement(`small`);
  date.className = `ml-1`;
  date.textContent = changes.date;
  header.appendChild(date);

  const block = document.createElement(`div`);
  block.className = `card-block`;
  card.appendChild(block);

  const listGroup = document.createElement(`div`);
  listGroup.className = `list-group`;
  block.appendChild(listGroup);

  Object.keys(changes).forEach(item => {
    const change = changes[item];

    if (Array.isArray(change)) {
      const groupItem = document.createElement(`div`);
      groupItem.className = `list-group-item flex-column align-items-start`;
      listGroup.appendChild(groupItem);

      const category = document.createElement(`h5`);
      category.className = `d-flex w-100 justify-content-between`;
      category.textContent = item;
      groupItem.appendChild(category);

      const changeList = document.createElement(`ul`);
      groupItem.appendChild(changeList);

      change.forEach(text => {
        const changeListBullet = document.createElement(`li`);
        changeListBullet.textContent = text;
        changeList.appendChild(changeListBullet);
      });
    }
  });

  document.getElementsByClassName(`container`)[0].appendChild(card);
});
