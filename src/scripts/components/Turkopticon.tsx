import React, { useEffect, useRef } from 'react';

import { TurkopticonIcon } from '../../components/TurkopticonIcon';
import { ReviewButton } from './ReviewButton';
import { injectReviewPopover } from '../../utils/injectReviewPopover';

interface Props {
  rid: string;
}

export function Turkopticon({ rid }: Props) {
  const ref = useRef(null);

  useEffect(() => {
    injectReviewPopover(ref, rid, rid, <div>{rid}</div>);
  }, []);

  return (
    <ReviewButton>
      <TurkopticonIcon />
      <script ref={ref} />
    </ReviewButton>
  );
}
