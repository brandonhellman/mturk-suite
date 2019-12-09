import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectOptions } from '../store/options/selectors';

export interface ThemeProps {
  children: any;
}

export default function Theme({ children }: ThemeProps) {
  const options = useSelector(selectOptions);

  useEffect(() => {
    switch (options.themes.mts) {
      case 'cerulean':
      case 'cosmo':
      case 'cyborg':
      case 'darkly':
      case 'flatly':
      case 'journal':
      case 'litera':
      case 'lumen':
      case 'lux':
      case 'materia':
      case 'minty':
      case 'pulse':
      case 'sandstone':
      case 'simplex':
      case 'sketchy':
      case 'slate':
      case 'solar':
      case 'spacelab':
      case 'superhero':
      case 'united':
      case 'yeti':
        require(`bootswatch/dist/${options.themes.mts}/bootstrap.min.css`);
        break;
      default:
        require('bootstrap/dist/css/bootstrap.css');
        break;
    }
  }, [options.themes.mts]);

  return <>{children}</>;
}
