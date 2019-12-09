import React from 'react';

import { OptionsPane } from './OptionsPane';
import { ChangeLogPane } from './ChangeLogPane';
import Theme from '../../../components/Theme';

export function App() {
  return (
    <Theme>
      <OptionsPane />
      <ChangeLogPane />
    </Theme>
  );
}
