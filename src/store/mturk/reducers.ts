import produce from 'immer';

import { MturkState, MturkActionTypes, MTURK_UPDATE } from './types';

const initialState: MturkState = {
  workerId: '',
};

export function mturkReducer(state = initialState, action: MturkActionTypes) {
  return produce(state, (draftState) => {
    switch (action.type) {
      case MTURK_UPDATE:
        draftState[action.payload.key] = action.payload.value;
        break;
    }
  });
}
