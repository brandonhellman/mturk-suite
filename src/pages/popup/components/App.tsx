import React from 'react';

const buttonStyle = {
  width: 200,
};

export default function App() {
  return (
    <>
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
