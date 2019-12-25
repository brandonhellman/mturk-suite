import React from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareSquare } from '@fortawesome/free-solid-svg-icons';

import Popover from '../../components/Popover';
import { selectOptions } from '../../store/options/selectors';

interface ProjectShareProps {
  hit_set_id: string;
}

export default function ProjectShare({}: ProjectShareProps) {
  const options = useSelector(selectOptions);

  return options.scripts.projectShare ? (
    <Popover
      content={<div></div>}
      icon={<FontAwesomeIcon className="text-primary" icon={faShareSquare} />}
      title="Project Share"
    />
  ) : null;
}
