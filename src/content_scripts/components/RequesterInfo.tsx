import React from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import Popover from '../../components/Popover';
import { selectOptions } from '../../store/options/selectors';

interface RequesterInfoProps {
  requester_id: string;
  requesterInfo?: {
    activityLevel: string;
    taskApprovalRate: string;
    taskReviewTime: string;
  };
}

export default function RequesterInfo({ requester_id, requesterInfo }: RequesterInfoProps) {
  const options = useSelector(selectOptions);

  return options.scripts.requesterInfo ? (
    <Popover
      content={
        <div>
          <div>Activity level: {requesterInfo.activityLevel}</div>
          <div>Approval rate: {requesterInfo.taskApprovalRate}</div>
          <div>Approval time: {requesterInfo.taskReviewTime}</div>
        </div>
      }
      icon={<FontAwesomeIcon className="text-primary" icon={faUser} />}
      title="Requester Info"
    />
  ) : null;
}
