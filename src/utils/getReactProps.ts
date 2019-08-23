import { getReactEl } from './getReactEl';

export interface ReactPropsCopyText {
  textToCopy: string;
}

export interface ReactPropsPagination {
  currentPage: number;
  lastPage: number;
}

export interface ReactPropsHitSetTable {
  bodyData: {
    accept_project_task_url: string;
    assignable_hits_count: number;
    assignment_duration_in_seconds: number;
    caller_meets_preview_requirements: boolean;
    caller_meets_requirements: boolean;
    creation_time: string;
    description: string;
    hit_set_id: string;
    last_updated_time: string;
    latest_expiration_time: string;
    monetary_reward: {
      currency_code: 'USD';
      amount_in_dollars: number;
    };
    project_requirements: {
      caller_meets_requirement: true;
      caller_qualification_value: {
        integer_value: 99;
        locale_value: {
          country: null;
          subdivision: null;
        };
      };
      comparator: 'EqualTo' | 'GreaterThanOrEqualTo' | string;
      qualification_type: {
        description: string;
        has_test: boolean;
        is_requestable: boolean;
        keywords: string;
        name: string;
        qualification_type_id: string;
        visibility: true;
      };
      qualification_type_id: string;
      qualification_values: string[];
      worker_action: 'AcceptHit';
    }[];
    project_tasks_url: string;
    requesterInfo: {
      activityLevel: 'High' | string;
      taskApprovalRate: '≥ 99%' | string;
      taskReviewTime: 'less than a day' | string;
    };
    requester_id: string;
    requester_name: string;
    requester_url: string;
    title: string;
  }[];
  tableConfig: object[];
}

export interface ReactPropsTaskQueueTable {
  bodyData: {
    accepted_at: string;
    assignment_id: string;
    deadline: string;
    expired_task_action_url: string;
    project: {
      assignable_hits_count: number;
      assignment_duration_in_seconds: number;
      caller_meets_preview_requirements: boolean;
      caller_meets_requirements: boolean;
      creation_time: string;
      description: string;
      hit_requirements: {
        caller_meets_requirement: true;
        caller_qualification_value: {
          integer_value: 99;
          locale_value: {
            country: null;
            subdivision: null;
          };
        };
        comparator: 'EqualTo' | 'GreaterThanOrEqualTo' | string;
        qualification_type: {
          description: string;
          has_test: boolean;
          is_requestable: boolean;
          keywords: string;
          name: string;
          qualification_type_id: string;
          visibility: true;
        };
        qualification_type_id: string;
        qualification_values: string[];
        worker_action: 'ViewHitSet';
      }[];
      hit_set_id: string;
      last_updated_time: string;
      latest_expiration_time: string;
      monetary_reward: {
        currency_code: 'USD';
        amount_in_dollars: number;
      };
      requester_id: string;
      requester_name: string;
      requester_url: string;
      title: string;
    };
    question: {
      attributes: {
        FrameHeight: string;
        FrameSourceAttribute: string;
      };
      type: 'ExternalURL' | string;
      value: string;
    };
    state: 'Assigned';
    task_id: string;
    task_url: string;
    time_to_deadline_in_seconds: number;
  }[];
  tableConfig: object[];
}

export interface ReactPropsHitStatusDetailsTable {
  bodyData: {
    assignment_id: string;
    contact_requester_url: string;
    hit_id: string;
    requester_feedback: string;
    requester_id: string;
    requester_name: string;
    reward: number;
    state: 'Paid' | string;
    title: string;
  }[];
  tableConfig: object[];
}

type ReactPropsTypes = ReactPropsCopyText & ReactPropsPagination & ReactPropsHitSetTable & ReactPropsTaskQueueTable & ReactPropsHitStatusDetailsTable;

export async function getReactProps(...selectors: string[]): Promise<ReactPropsTypes> {
  const el = await getReactEl(...selectors);
  return JSON.parse(el.dataset.reactProps);
}
