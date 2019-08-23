import React, { useEffect, useRef } from 'react';

import { TurkerviewIcon } from '../../components/TurkerviewIcon';
import { ReviewButton } from './ReviewButton';
import { injectReviewPopover } from '../../utils/injectReviewPopover';

interface Props {
  rid: string;
}

export function Turkerview({ rid }: Props) {
  const ref = useRef(null);

  useEffect(() => {
    injectReviewPopover(ref, rid, rid, <div>{rid}</div>);
  }, []);

  return (
    <ReviewButton>
      <TurkerviewIcon />
      <script ref={ref} />
    </ReviewButton>
  );
}
