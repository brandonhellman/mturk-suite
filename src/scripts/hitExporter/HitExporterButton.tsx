import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareSquare } from '@fortawesome/free-solid-svg-icons';

import { PopoverButton } from '../../components/PopoverButton';
import { injectPopover } from '../../utils/injectPopover';

import { HitExporterPopover } from './HitExporterPopover';

export function HitExporterButton() {
    
  const ref = useRef(null);

  useEffect(() => {
    injectPopover(ref, 'HIT Exporter', <HitExporterPopover />);
  }, []);

  return (
    <PopoverButton>
      <FontAwesomeIcon className="text-primary" icon={faShareSquare} />
      <script ref={ref} />
    </PopoverButton>
  );
}
