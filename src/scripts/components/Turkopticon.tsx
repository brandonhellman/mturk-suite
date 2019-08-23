import React, { useEffect, useRef } from 'react';

import { TurkopticonIcon } from '../../components/TurkopticonIcon';
import { TurkopticonPopover } from '../containers/TurkopticonPopover';
import { injectReviewPopover } from '../../utils/injectReviewPopover';
import { ReviewButton } from './ReviewButton';

interface Props {
  rid: string;
}

export function Turkopticon({ rid }: Props) {
  const ref = useRef(null);

  useEffect(() => {
    injectReviewPopover(ref, rid, rid, <TurkopticonPopover rid={rid} />);
  }, []);

  return (
    <ReviewButton>
      <TurkopticonIcon />
      <script ref={ref} />
    </ReviewButton>
  );
}
