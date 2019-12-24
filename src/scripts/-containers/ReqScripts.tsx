import React from 'react';
import { useSelector } from 'react-redux';

import { selectOptions } from '../../store/options/selectors';

import { Turkerview } from '../components/Turkerview';
import { Turkopticon } from '../components/Turkopticon';

interface Props {
  requester_id: string;
  requester_name: string;
}

export function ReqScripts({ requester_id, requester_name }: Props) {
  const options = useSelector(selectOptions);

  return (
    <>
      {options.scripts.turkerview && <Turkerview requester_id={requester_id} requester_name={requester_name} />}
      {options.scripts.turkopticon && <Turkopticon requester_id={requester_id} requester_name={requester_name} />}
    </>
  );
}
