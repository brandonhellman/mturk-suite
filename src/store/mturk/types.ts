export const MturkInitialState = {
  workerId: 'Please visit worker.mturk.com',
};

export type MturkState = typeof MturkInitialState;

export interface MturkUpdateAction {
  type: 'MTURK_UPDATE';
  payload: {
    key: keyof MturkState;
    value: string;
  };
}

export type MturkActionTypes = MturkUpdateAction;
