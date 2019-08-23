import React from 'react';

import { TurkopticonIcon } from '../../components/TurkopticonIcon';
import { ReviewButton } from '../components/ReviewButton';

interface Props {
  rid: string;
}

export function Turkopticon({ rid }: Props) {
  return (
    <ReviewButton>
      <TurkopticonIcon />
    </ReviewButton>
  );
}
