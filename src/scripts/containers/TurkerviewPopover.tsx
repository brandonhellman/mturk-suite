import React from 'react';

interface Props {
  requester_id: string;
}

export function TurkerviewPopover({ requester_id }: Props) {
  return (
    <div>
      <h2 className="text-center">
        <a className="text-primary" href={`https://turkerview.com/requesters/${requester_id}`} target="_blank">
          TurkerView
        </a>
        <span className="text-muted">
          <small> (0 Reviews)</small>
        </span>
      </h2>
    </div>
  );
}
