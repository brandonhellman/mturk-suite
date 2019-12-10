import { MturkState, MturkActionTypes } from './types';

const initialState: MturkState = {
  workerId: 'Please visit worker.mturk.com',
};

export function mturkReducer(state = initialState, action: MturkActionTypes) {
  switch (action.type) {
    case 'MTURK_UPDATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
