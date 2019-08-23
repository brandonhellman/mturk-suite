import React from 'react';
import { useSelector } from 'react-redux';

import { selectOptions } from '../../store/options/selectors';

import { Turkerview } from './Turkerview';
import { Turkopticon } from './Turkopticon';

interface Props {
  rid: string;
  rname: string;
}

export function Review({ rid, rname }: Props) {
  const options = useSelector(selectOptions);

  return (
    <>
      {options.scripts.turkerview && <Turkerview rid={rid} rname={rname}/>}
      {options.scripts.turkopticon && <Turkopticon rid={rid} rname={rname} />}
    </>
  );
}
