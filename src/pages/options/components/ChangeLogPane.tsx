import React from 'react';

const versions = {
  '3.0.0': {
    date: '??-??-2019',
    changes: ['Rewrote the entire extension in React and Typescript'],
  },
};

export default function ChangeLogPane() {
  return (
    <div>
      {Object.entries(versions).map(([key, value]) => (
        <div key={key}>
          <h5>
            v{key} - {value.date}
          </h5>
          <ul>
            {value.changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
