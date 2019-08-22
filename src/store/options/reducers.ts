import produce from 'immer';

import { OptionsState, OptionsActionTypes, OPTIONS_UPDATE_SCRIPTS } from './types';

const initialState: OptionsState = {
  scripts: {
    confirmReturnHit: true,
    rateLimitReloader: true,
  },
};

export function optionsReducer(state = initialState, action: OptionsActionTypes) {
  return produce(state, (draftState) => {
    switch (action.type) {
      case OPTIONS_UPDATE_SCRIPTS:
        draftState.scripts[action.payload.key] = action.payload.value;
        break;
    }
  });
}
