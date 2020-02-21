declare namespace Mturk {
  interface Project {
    hit_set_id: string;
    requester_id: string;
    requester_name: string;
    title: string;
    description: string;
    assignment_duration_in_seconds: number;
    creation_time: string;
    assignable_hits_count: number;
    latest_expiration_time: string;
    caller_meets_requirements: boolean;
    caller_meets_preview_requirements: boolean;
    last_updated_time: string;
    monetary_reward: {
      currency_code: 'USD' | string;
      amount_in_dollars: number;
    };
    requester_url: string;
  }

  interface Qualification {
    caller_meets_requirement: boolean;
    caller_qualification_value: {
      integer_value: number | null;
      locale_value: {
        country: null;
        subdivision: null;
      };
    };
    comparator: 'Exists' | 'GreaterThanOrEqualTo' | 'NotIn' | string;
    qualification_request_url: string;
    qualification_type: {
      description: string;
      has_test: boolean;
      is_requestable: boolean;
      keywords: string;
      name: string;
      qualification_type_id: string;
      visibility: boolean;
    };
    qualification_type_id: string;
    qualification_values: string[];
    worker_action: string;
  }

  interface PreviewProject extends Project {
    caller_meets_requirements: boolean;
    caller_meets_preview_requirements: boolean;
    hit_requirements: Qualification[];
  }

  interface SearchProject extends Project {
    accept_project_task_url: string;
    project_tasks_url: string;
    project_requirements: Qualification[];
    requesterInfo: {
      activityLevel: 'High' | 'Limited';
      taskApprovalRate: 'Not available' | string;
      taskReviewTime: 'less than a day';
    };
  }

  interface QueueProject extends Project {
    caller_meets_requirements: boolean;
    caller_meets_preview_requirements: boolean;
    hit_requirements: Qualification[];
  }

  namespace JSON {
    interface Dashboard {
      available_earnings: {
        currency_code: 'USD' | string;
        amount_in_dollars: number;
      };
      hits_overview: {
        approved: number;
        approval_rate: number;
        pending: number;
        rejected: number;
        rejection_rate: number;
      };
      daily_hit_statistics_overview: {
        date: string;
        submitted: number;
        approved: number;
        rejected: number;
        pending: number;
        hits_rewards: number;
        bonus_rewards: number;
        earnings: number;
      }[];
      earnings_to_date: {
        approved: number;
        bonuses: number;
        total_earnings: number;
      };
      earnings_by_period: {
        yearly_earnings: {
          [key: string]: number;
        };
        monthly_earnings: {
          [key: string]: number;
        };
        quarterly_earnings: {
          [key: string]: number;
        };
      };
    }

    interface ProjectPreview {
      task_id: string;
      assignment_id: null;
      accepted_at: null;
      deadline: null;
      time_to_deadline_in_seconds: null;
      state: null;
      question: {
        value: string;
        type: 'ExternalURL';
        attributes: {
          FrameSourceAttribute: string;
          FrameHeight: string;
        };
      };
      project: PreviewProject;
    }

    interface StatusDetails {
      results: {
        assignment_id: string;
        hit_id: string;
        state: string;
        title: string;
        requester_id: string;
        requester_name: string;
        requester_feedback: string | null;
        reward: {
          currency_code: 'USD' | string;
          amount_in_dollars: number;
        };
      }[];
      page_number: number;
      num_results: number;
      total_num_results: number;
    }

    interface Search {
      results: SearchProject[];
      page_number: number;
      num_results: number;
      total_num_results: number;
    }

    interface Queue {
      tasks: {
        task_id: string;
        assignment_id: string;
        accepted_at: string;
        deadline: string;
        time_to_deadline_in_seconds: number;
        state: 'Assigned';
        question: {
          value: string;
          type: 'ExternalURL';
          attributes: {
            FrameSourceAttribute: string;
            FrameHeight: string;
          };
        };
        project: QueueProject;
        expired_task_action_url: string;
        task_url: string;
      }[];
    }
  }

  namespace ReactProps {
    interface ShowModal {
      modalType: 'ProjectDetailsModal';
      modalHeader: 'HIT Details';
      modalOptions: {
        requesterName: string;
        projectTitle: string;
        description: string;
        assignableHitsCount: number;
        creationTime: string;
        assignmentDurationInSeconds: number;
        expirationTime: string;
        contactRequesterUrl: string;
        monetaryReward: {
          amountInDollars: number;
          currencyCode: 'USD';
        };
      };
      children: 'HIT Details';
    }

    interface TaskSubmitter {
      hiddenFormParams: {
        task_id: string;
      };
    }

    interface CompletionTimer {
      displayStyle: 'elapsed';
      timeRemainingInSeconds: number;
      originalTimeToCompleteInSeconds: number;
    }
  }
}
