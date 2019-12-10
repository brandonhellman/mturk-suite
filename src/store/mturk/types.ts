export const MturkInitialState: MturkState = {
  workerId: 'Please visit worker.mturk.com',
};

export interface MturkState {
  workerId: string;
}

export interface MturkUpdateAction {
  type: 'MTURK_UPDATE';
  payload: Partial<MturkState>;
}

export type MturkActionTypes = MturkUpdateAction;
