import React from 'react';
import { useSelector } from 'react-redux';

import Popover from '../../components/Popover';
import TurkerviewIcon from '../../components/TurkerviewIcon';
import { selectOptions } from '../../store/options/selectors';

interface ProjectTurkerviewProps {
  hit_set_id: string;
}

export default function ProjetTurkerview({ hit_set_id }: ProjectTurkerviewProps) {
  const options = useSelector(selectOptions);

  return options.scripts.turkerview ? (
    <Popover content={<div></div>} icon={<TurkerviewIcon />} title="Project Turkerview" />
  ) : null;
}
