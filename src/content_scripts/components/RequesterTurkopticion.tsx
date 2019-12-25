import React from 'react';
import { useSelector } from 'react-redux';

import Popover from '../../components/Popover';
import TurkopticonIcon from '../../components/TurkopticonIcon';
import { selectOptions } from '../../store/options/selectors';

interface RequesterTurkopticonProps {
  requester_id: string;
}

export default function RequesterTurkopticon({ requester_id }: RequesterTurkopticonProps) {
  const options = useSelector(selectOptions);

  return options.scripts.turkopticon ? (
    <Popover content={<div></div>} icon={<TurkopticonIcon />} title="Requester Turkopticon" />
  ) : null;
}
