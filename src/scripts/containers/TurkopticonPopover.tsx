import React from 'react';

interface Props {
  rid: string;
}

export function TurkopticonPopover({ rid }: Props) {
  return (
    <div>
      <h2 className="text-center">
        <a className="text-primary" href={`https://turkopticon.ucsd.edu/${rid}`} target="_blank">
          Turkopticon
        </a>
        <span className="text-muted">
          <small> (0 Reviews)</small>
        </span>
      </h2>
    </div>
  );
}
