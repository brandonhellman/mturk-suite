import React, { useEffect, useRef } from 'react';

import { HitExportIcon } from '../../components/HitExportIcon';
import { HitExportPopover } from '../-containers/HitExportPopover';
import { injectPopover } from '../../utils/injectPopover';

import { PopoverButton } from './PopoverButton';

interface Props {}

export function HitExport({  }: Props) {
  const ref = useRef(null);

  useEffect(() => {
    injectPopover(ref, 'HIT Exporter', <HitExportPopover />);
  }, []);

  return (
    <PopoverButton>
      <HitExportIcon />
      <script ref={ref} />
    </PopoverButton>
  );
}
