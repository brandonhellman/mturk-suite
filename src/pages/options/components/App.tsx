import React from 'react';

import Theme from '../../../components/Theme';

import OptionsPane from './OptionsPane';
import ChangeLogPane from './ChangeLogPane';

export default function App() {
  return (
    <Theme>
      <OptionsPane />
      <ChangeLogPane />
    </Theme>
  );
}
