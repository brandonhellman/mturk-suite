import React, { useEffect, useRef } from 'react';

import { TurkerviewIcon } from '../../components/TurkerviewIcon';
import { TurkerviewPopover } from '../containers/TurkerviewPopover';
import { injectReviewPopover } from '../../utils/injectReviewPopover';
import { ReviewButton } from './ReviewButton';
interface Props {
  rid: string;
}

export function Turkerview({ rid }: Props) {
  const ref = useRef(null);

  useEffect(() => {
    injectReviewPopover(ref, rid, rid, <TurkerviewPopover rid={rid} />);
  }, []);

  return (
    <ReviewButton>
      <TurkerviewIcon />
      <script ref={ref} />
    </ReviewButton>
  );
}
