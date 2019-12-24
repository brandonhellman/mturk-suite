import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import { PopoverButton } from '../../components/PopoverButton';
import { injectPopover } from '../../utils/injectPopover';

import { RequesterInfoPopover } from './RequesterInfoPopover';

export function RequesterInfoButton() {
    
  const ref = useRef(null);

  useEffect(() => {
    injectPopover(ref, 'Requester Info', <RequesterInfoPopover />);
  }, []);

  return (
    <PopoverButton>
      <FontAwesomeIcon className="text-primary" icon={faUser} />
      <script ref={ref} />
    </PopoverButton>
  );
}
