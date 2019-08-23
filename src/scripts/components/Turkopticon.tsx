import React, { useEffect, useRef } from 'react';

import { TurkopticonIcon } from '../../components/TurkopticonIcon';
import { injectReviewPopover } from '../../utils/injectReviewPopover';
import { TurkopticonPopover } from '../containers/TurkopticonPopover';
import { ReviewButton } from './ReviewButton';

interface Props {
  rid: string;
  rname: string;
}

export function Turkopticon({ rid, rname }: Props) {
  const ref = useRef(null);

  useEffect(() => {
    injectReviewPopover(ref, rid, rname, <TurkopticonPopover rid={rid} />);
  }, []);

  return (
    <ReviewButton>
      <TurkopticonIcon />
      <script ref={ref} />
    </ReviewButton>
  );
}
