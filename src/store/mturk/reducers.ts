import produce from 'immer';

import { MturkState, MturkActionTypes } from './types';

const initialState: MturkState = {
  workerId: 'Please visit worker.mturk.com',
};

export function mturkReducer(state = initialState, action: MturkActionTypes) {
  return produce(state, (draftState) => {
    switch (action.type) {
      case 'MTURK_UPDATE':
        draftState[action.payload.key] = action.payload.value;
        break;
    }
  });
}
