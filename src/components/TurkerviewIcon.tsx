import { browser } from 'webextension-polyfill-ts';
import React from 'react';

import tvgreen from '../assets/images/tv-green.png';
import tvorange from '../assets/images/tv-orange.png';
import tvred from '../assets/images/tv-red.png';
import tvunrated from '../assets/images/tv-unrated.png';
import tvwhite from '../assets/images/tv-white.png';

interface Props {
  variant?: 'green' | 'orange' | 'red' | 'unrated' | 'white';
}

export function TurkerviewIcon({ variant = 'unrated' }: Props) {
  let img;

  switch (variant) {
    case 'green':
      img = tvgreen;
      break;
    case 'orange': 
      img = tvorange;
      break;
    case 'red':
      img = tvred;
      break;
    case 'unrated':
      img = tvunrated;
      break;
    case 'white':
      img = tvwhite;
      break;
  }

  return <img src={browser.extension.getURL(img)} style={{ maxHeight: 16 }}></img>;
}
