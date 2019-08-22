export interface MturkState {
  workerId: string;
}

export const MTURK_UPDATE = 'MTURK_UPDATE';

export interface MturkUpdateAction {
  type: typeof MTURK_UPDATE;
  payload: {
    key: 'workerId';
    value: string;
  };
}

export type MturkActionTypes = MturkUpdateAction;
