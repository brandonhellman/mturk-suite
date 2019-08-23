import React from 'react';

import { TurkopticonIcon } from '../../components/TurkopticonIcon';

interface Props {
  rid: string;
}

export function Turkopticon({ rid }: Props) {
  return (
    <span className="btn btn-sm btn-default">
      <TurkopticonIcon />
    </span>
  );
}
