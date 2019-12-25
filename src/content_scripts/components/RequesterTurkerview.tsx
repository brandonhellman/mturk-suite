import React from 'react';
import { useSelector } from 'react-redux';

import Popover from '../../components/Popover';
import TurkerviewIcon from '../../components/TurkerviewIcon';
import { selectOptions } from '../../store/options/selectors';

interface RequesterTurkerviewProps {
  requester_id: string;
}

export default function RequesterTurkerview({ requester_id }: RequesterTurkerviewProps) {
  const options = useSelector(selectOptions);

  return options.scripts.turkerview ? (
    <Popover content={<div></div>} icon={<TurkerviewIcon />} title="Requester Turkerview" />
  ) : null;
}
