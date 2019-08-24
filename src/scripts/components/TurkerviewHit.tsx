import React, { useEffect, useRef } from 'react';

import { TurkerviewIcon } from '../../components/TurkerviewIcon';
import { TurkerviewHitPopover } from '../containers/TurkerviewHitPopover';
import { injectPopover } from '../../utils/injectPopover';
import { PopoverButton } from './PopoverButton';

interface Props {}

export function TurkerviewHit({  }: Props) {
  const ref = useRef(null);

  useEffect(() => {
    injectPopover(ref, 'Turkerview HIT Ratings', <TurkerviewHitPopover />);
  }, []);

  return (
    <PopoverButton>
      <TurkerviewIcon />
      <script ref={ref} />
    </PopoverButton>
  );
}
