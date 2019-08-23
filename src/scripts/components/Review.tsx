import React from 'react';
import { useSelector } from 'react-redux';

import { selectOptions } from '../../store/options/selectors';

import { Turkerview } from './Turkerview';
import { Turkopticon } from './Turkopticon';

interface Props {
  rid: string;
}

export function Review({ rid }: Props) {
  const options = useSelector(selectOptions);

  return (
    <>
      {options.scripts.turkerview && <Turkerview rid={rid} />}
      {options.scripts.turkopticon && <Turkopticon rid={rid} />}
    </>
  );
}
