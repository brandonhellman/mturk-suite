import { browser } from 'webextension-polyfill-ts';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

const buttonStyle = {
  width: 200,
};

export default function App() {
  return (
    <>
      <div className="d-flex bg-primary text-white mb-1 p-1">
        <div className="flex-grow-1 align-self-center">
          Mturk Suite <small>v{browser.runtime.getManifest().version}</small>
        </div>
        <a className="btn btn-sm text-white" href="/pages/options/index.html" target="_blank">
          <FontAwesomeIcon icon={faCog} />
        </a>
      </div>
      <a className="btn btn-primary mb-1" href="/pages/hit_finder/index.html" style={buttonStyle} target="_blank">
        HIT Finder
      </a>
      <a className="btn btn-primary mb-1" href="/pages/hit_catcher/index.html" style={buttonStyle} target="_blank">
        HIT Catcher
      </a>
      <a className="btn btn-primary" href="/pages/hit_tracker/index.html" style={buttonStyle} target="_blank">
        HIT Tracker
      </a>
    </>
  );
}
