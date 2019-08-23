import React from 'react';

import { TurkerviewIcon } from '../../components/TurkerviewIcon';
import { ReviewButton } from '../components/ReviewButton';

interface Props {
  rid: string;
}

export function Turkerview({ rid }: Props) {
  return (
    <ReviewButton>
      <TurkerviewIcon />
    </ReviewButton>
  );
}
