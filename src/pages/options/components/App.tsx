import React, { useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';

import { ChangeLogPane } from './ChangeLogPane';
import { OptionsPane } from '../containers/OptionsPane';

export function App() {
  const [key, setKey] = useState('options');

  function onSelect(k: string) {
    setKey(k);
  }

  return (
    <Tab.Container activeKey={key} onSelect={onSelect}>
      <Nav variant="pills">
        <Nav.Item >
          <Nav.Link eventKey="options">Options</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="change-log">Change Log</Nav.Link>
        </Nav.Item>
      </Nav>

      <Tab.Content>
        <OptionsPane />
        <ChangeLogPane />
      </Tab.Content>
    </Tab.Container>
  );
}
