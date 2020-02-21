import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Nav, Tab } from 'react-bootstrap';

import { Settings, saveSettings } from '../utils/settings';

interface SettingsModalProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SettingsModal(props: SettingsModalProps) {
  const [changed, setChanged] = useState(false);
  const [settings, setSettings] = useState(props.settings);

  function updateSettings(changes: Partial<Settings>) {
    setChanged(true);
    setSettings({ ...settings, ...changes });
  }

  function saveChanges() {
    saveSettings(settings);
    props.setSettings(settings);
    props.setShowSettings(false);
  }

  useEffect(() => {
    if (props.showSettings) {
      setSettings(props.settings);
    }
  }, [props.settings, props.showSettings]);

  return (
    <Modal show={props.showSettings} onHide={() => props.setShowSettings(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tab.Container defaultActiveKey="general">
          <Nav variant="pills">
            <Nav.Item>
              <Nav.Link eventKey="general">General</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="notifications">Notifications</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="display">Display</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="general">
              {' '}
              <Form>
                <Form.Group>
                  <Form.Label>Delay in ms</Form.Label>
                  <Form.Control
                    type="number"
                    min="500"
                    step="500"
                    value={settings.delayInMs}
                    onChange={(event: any) => updateSettings({ delayInMs: event.currentTarget.value })}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Sort by</Form.Label>
                  <Form.Control
                    as="select"
                    value={settings.filterSort}
                    onChange={(event) => updateSettings({ filterSort: event.currentTarget.value as any })}
                  >
                    <option value="updated_asc">Creation date: oldest first</option>
                    <option value="updated_desc">Creation date: newest first</option>
                    <option value="reward_asc">Reward amount: lowest first</option>
                    <option value="reward_desc">Reward amount: highest first</option>
                    <option value="num_hits_asc">HITs: least first</option>
                    <option value="num_hits_desc">HITs: most first</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Page size</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={settings.filterPageSize}
                    onChange={(event: any) => updateSettings({ filterPageSize: event.currentTarget.value })}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="I'm qualified to work on"
                    checked={settings.filterQualified}
                    onChange={(event: any) => updateSettings({ filterQualified: event.currentTarget.checked })}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Require Masters Qualification"
                    checked={settings.filterMasters}
                    onChange={(event: any) => updateSettings({ filterMasters: event.currentTarget.checked })}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Search term</Form.Label>
                  <Form.Control
                    value={settings.filterSearchTerm}
                    onChange={(event: any) => updateSettings({ filterSearchTerm: event.currentTarget.value })}
                  />
                </Form.Group>
              </Form>
            </Tab.Pane>
            <Tab.Pane eventKey="notifications">notifications</Tab.Pane>
            <Tab.Pane eventKey="display">display</Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => props.setShowSettings(false)}>
          Close
        </Button>
        <Button disabled={!changed} variant="primary" onClick={saveChanges}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
