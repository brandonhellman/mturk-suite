import React, { useEffect, useRef } from 'react';

import { TurkerviewIcon } from '../../components/TurkerviewIcon';
import { TurkerviewHitPopover } from '../containers/TurkerviewHitPopover';
import { injectPopover } from '../../utils/injectPopover';
import { ReviewButton } from './ReviewButton';

interface Props {}

export function TurkerviewHit({  }: Props) {
  const ref = useRef(null);

  useEffect(() => {
    injectPopover(ref, 'Turkerview HIT Ratings', <TurkerviewHitPopover />);
  }, []);

  return (
    <ReviewButton>
      <TurkerviewIcon />
      <script ref={ref} />
    </ReviewButton>
  );
}
