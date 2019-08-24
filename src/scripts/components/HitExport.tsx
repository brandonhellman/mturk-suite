import React, { useEffect, useRef } from 'react';

import { HitExportIcon } from '../../components/HitExportIcon';
import { HitExportPopover } from '../containers/HitExportPopover';
import { injectPopover } from '../../utils/injectPopover';
import { ReviewButton } from './ReviewButton';

interface Props {}

export function HitExport({  }: Props) {
  const ref = useRef(null);

  useEffect(() => {
    injectPopover(ref, 'HIT Exporter', <HitExportPopover />);
  }, []);

  return (
    <ReviewButton>
      <HitExportIcon />
      <script ref={ref} />
    </ReviewButton>
  );
}
