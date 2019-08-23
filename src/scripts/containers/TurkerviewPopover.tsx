import React from 'react';

interface Props {
  rid: string;
}

export function TurkerviewPopover({ rid }: Props) {
  return (
    <div>
      <h2 className="text-center">
        <a className="text-primary" href={`https://turkerview.com/requesters/${rid}`} target="_blank">
          TurkerView
        </a>
        <span className="text-muted">
          <small> (0 Reviews)</small>
        </span>
      </h2>
    </div>
  );
}
