import React, { useEffect, useRef } from 'react';

import { TurkopticonIcon } from '../../components/TurkopticonIcon';
import { injectPopover } from '../../utils/injectPopover';
import { TurkopticonPopover } from '../containers/TurkopticonPopover';
import { PopoverButton } from './PopoverButton';

interface Props {
  requester_id: string;
  requester_name: string;
}

export function Turkopticon({ requester_id, requester_name }: Props) {
  const ref = useRef(null);

  useEffect(() => {
    injectPopover(ref, `${requester_name} [${requester_id}]`, <TurkopticonPopover requester_id={requester_id} />);
  }, []);

  return (
    <PopoverButton>
      <TurkopticonIcon />
      <script ref={ref} />
    </PopoverButton>
  );
}
