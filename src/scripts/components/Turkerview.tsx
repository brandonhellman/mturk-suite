import React, { useEffect, useRef } from 'react';

import { TurkerviewIcon } from '../../components/TurkerviewIcon';
import { TurkerviewPopover } from '../containers/TurkerviewPopover';
import { injectReviewPopover } from '../../utils/injectReviewPopover';
import { ReviewButton } from './ReviewButton';
interface Props {
  rid: string;
  rname: string;
}

export function Turkerview({ rid, rname }: Props) {
  const ref = useRef(null);

  useEffect(() => {
    injectReviewPopover(ref, rid, rname, <TurkerviewPopover rid={rid} />);
  }, []);

  return (
    <ReviewButton>
      <TurkerviewIcon />
      <script ref={ref} />
    </ReviewButton>
  );
}
