import React from 'react';

import { TurkerviewIcon } from '../../components/TurkerviewIcon';

interface Props {
  rid: string;
}

export function Turkerview({ rid }: Props) {
  return (
    <span className="btn btn-sm btn-default">
      <TurkerviewIcon />
    </span>
  );
}
