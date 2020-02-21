import moment from 'moment';
import React from 'react';
import { Button, ButtonGroup, OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import toCurrency from '../../../utils/toCurrency';

interface HitGroupsTableProps {
  hits: (Mturk.JSON.Search['results'][0] & { time: number })[];
  time?: boolean;
}

export default function HitGroupsTable({ hits, time }: HitGroupsTableProps) {
  return (
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th className="w-1"></th>
          {time && <th className="w-1">Time</th>}
          <th>Requester</th>
          <th>Title</th>
          <th className="text-center w-1">HITs</th>
          <th className="text-center">Accept</th>
          <th className="text-center w-1">HC</th>
        </tr>
      </thead>
      <tbody>
        {hits.map((hit) => (
          <tr key={hit.hit_set_id}>
            <td>
              <Button size="sm">
                <FontAwesomeIcon icon={faInfoCircle} />
              </Button>
            </td>
            {time && <td>{moment(hit.time).format('h:mma')}</td>}
            <td>
              <a
                href={`https://worker.mturk.com/requesters/${hit.requester_id}/projects`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hit.requester_name}
              </a>
            </td>
            <td>
              <a
                href={`https://worker.mturk.com/projects/${hit.hit_set_id}/tasks`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hit.title}
              </a>
            </td>
            <td className="text-center">{hit.assignable_hits_count}</td>
            <td className="text-center">
              <a
                href={`https://worker.mturk.com/projects/${hit.hit_set_id}/tasks/accept_random`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {toCurrency(hit.monetary_reward.amount_in_dollars)}
              </a>
            </td>
            <td className="text-center">
              <ButtonGroup className="mr-2" aria-label="Second group" size="sm">
                <OverlayTrigger
                  delay={250}
                  placement="top"
                  overlay={<Tooltip id="once-catcher-tooltip">Once Catcher</Tooltip>}
                >
                  <Button>O</Button>
                </OverlayTrigger>
                <OverlayTrigger
                  delay={250}
                  placement="top"
                  overlay={<Tooltip id="many-catcher-tooltip">Many Catcher</Tooltip>}
                >
                  <Button>M</Button>
                </OverlayTrigger>
              </ButtonGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
