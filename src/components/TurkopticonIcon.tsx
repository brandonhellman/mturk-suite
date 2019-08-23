import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

interface Props {
  variant?: 'success' | 'warning' | 'danger' | 'muted';
}

export function TurkopticonIcon({ variant = 'muted' }: Props) {
  return <FontAwesomeIcon className={`text-${variant}`} icon={faUser} />;
}
