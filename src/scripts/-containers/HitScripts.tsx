import React from 'react';
import { useSelector } from 'react-redux';

import { selectOptions } from '../../store/options/selectors';

import { HitExport } from '../components/HitExport';
import { TurkerviewHit } from '../components/TurkerviewHit';

export function HitScripts() {
  const options = useSelector(selectOptions);

  return (
    <>
      {options.scripts.turkerview && <TurkerviewHit />}
      {options.scripts.hitExporter && <HitExport />}
    </>
  );
}
