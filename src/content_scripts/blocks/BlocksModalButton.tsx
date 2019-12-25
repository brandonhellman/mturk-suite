import React from 'react';
import ReactDOM from 'react-dom';

function BlocksModalButton() {
  return (
    <button type="button" className="btn btn-primary m-l-lg" data-toggle="modal" data-target="#blocks-modal">
      Blocks
    </button>
  );
}

export default function() {
  const react = document.createElement('react');
  document.querySelector('[data-target="#filter"]').insertAdjacentElement('beforebegin', react);
  return ReactDOM.createPortal(<BlocksModalButton />, react);
}
