import React from 'react';

interface Props {
  requester_id: string;
}

export function TurkopticonPopover({ requester_id }: Props) {
  return (
    <div>
      <h2 className="text-center">
        <a className="text-primary" href={`https://turkopticon.ucsd.edu/${requester_id}`} target="_blank">
          Turkopticon
        </a>
        <span className="text-muted">
          <small> (0 Reviews)</small>
        </span>
      </h2>
    </div>
  );
}
