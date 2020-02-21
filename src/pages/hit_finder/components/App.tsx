import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { Button, Card } from 'react-bootstrap';

import { loadSettings } from '../utils/settings';

import HitGroupsTable from './HitGroupsTable';
import SettingsModal from './SettingsModal';

const allHits: { [key: string]: Mturk.JSON.Search['results'][0] & { time: number } } = {};

export default function App() {
  const [enabled, setEnabled] = useState(false);
  const [settings, setSettings] = useState(loadSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [showRecentHits, setShowRecentHits] = useState(true);
  const [showLoggedHits, setShowLoggedHits] = useState(true);
  const [recentHits, setRecentHits] = useState<string[]>([]);
  const [loggedHits, setLoggedHits] = useState<string[]>([]);
  const [scanTime, setScanTime] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [preCount, setPreCount] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    async function main() {
      try {
        const url = new URL('https://worker.mturk.com/');
        url.searchParams.append('sort', settings.filterSort);
        url.searchParams.append('page_size', settings.filterPageSize);
        url.searchParams.append('filters[masters]', settings.filterMasters.toString());
        url.searchParams.append('filters[qualified]', settings.filterQualified.toString());
        url.searchParams.append('filters[min_reward]', settings.filterMinReward);
        url.searchParams.append('filters[search_term]', settings.filterSearchTerm);
        url.searchParams.append('format', 'json');

        const response = await fetch(url.href, { credentials: 'include' });

        if (response.url.includes('https://worker.mturk.com')) {
          if (response.ok) {
            const json: Mturk.JSON.Search = await response.json();

            let recent: string[] = [];
            let logged: string[] = [];

            json.results.forEach((hit) => {
              recent.push(hit.hit_set_id);

              if (!allHits[hit.hit_set_id]) {
                allHits[hit.hit_set_id] = { ...hit, time: Date.now() };
                logged.push(hit.hit_set_id);
              } else {
                allHits[hit.hit_set_id] = { ...allHits[hit.hit_set_id], ...hit };
              }
            });

            setRecentHits(recent);
            setLoggedHits((loggedHits) => [...logged, ...loggedHits]);
          }
          if (response.status === 429) {
            setPreCount((preCount) => preCount + 1);
          }
        } else {
          // finderLoggedOut();
        }
      } catch (error) {
        console.log(error);
      } finally {
        setScanTime(Date.now());
        setScanCount((scanCount) => scanCount + 1);

        if (enabled) {
          timeout = setTimeout(main, +settings.delayInMs);
        }
      }
    }

    if (enabled) {
      timeout = setTimeout(main, 0);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [enabled, settings]);

  return (
    <>
      <div className="d-flex mb-3">
        <Button className="mr-1" variant={enabled ? 'danger' : 'success'} onClick={() => setEnabled(!enabled)}>
          {enabled ? 'Stop' : 'Start'}
        </Button>
        <Button
          className="mr-1"
          variant={showRecentHits ? 'outline-primary' : 'primary'}
          onClick={() => setShowRecentHits(!showRecentHits)}
        >
          {showRecentHits ? 'Hide' : 'Show'} Recent HITs
        </Button>
        <Button
          className="mr-1"
          variant={showLoggedHits ? 'outline-primary' : 'primary'}
          onClick={() => setShowLoggedHits(!showLoggedHits)}
        >
          {showLoggedHits ? 'Hide' : 'Show'} Logged HITs
        </Button>
        <Button className="ml-auto mr-1" variant="primary">
          Blocks
        </Button>
        <Button className="mr-1" variant="primary">
          Favorites
        </Button>
        <Button variant="primary" onClick={() => setShowSettings(true)}>
          Settings
        </Button>
        <SettingsModal
          settings={settings}
          setSettings={setSettings}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
        />
      </div>
      {showRecentHits && (
        <Card>
          <Card.Header>
            Recent HITs
            <small className="ml-2">
              Found: {recentHits.length} | Blocked: {recentHits.filter((hit: any) => hit.blocked).length} | {}
              {scanTime ? moment(scanTime).format('LTS') : 'Never'}
            </small>
            <small className="float-right">
              Scans: {scanCount} | PREs: {preCount}
            </small>
          </Card.Header>
          <Card.Body className="p-0">
            <HitGroupsTable hits={recentHits.map((id) => allHits[id])} />
          </Card.Body>
        </Card>
      )}
      {showLoggedHits && (
        <Card>
          <Card.Header>
            Logged HITs
            <small className="float-right">HITs Logged: {loggedHits.length}</small>
          </Card.Header>
          <Card.Body className="p-0">
            <HitGroupsTable hits={loggedHits.map((id) => allHits[id])} time />
          </Card.Body>
        </Card>
      )}
    </>
  );
}
