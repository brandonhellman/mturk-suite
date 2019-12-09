import produce from 'immer';

import { OptionsInitialState, OptionsActionTypes } from './types';

export function optionsReducer(state = OptionsInitialState, action: OptionsActionTypes) {
  return produce(state, (draftState) => {
    switch (action.type) {
      case 'OPTIONS_SCRIPTS_TOGGLE':
        draftState.scripts[action.payload] = !draftState.scripts[action.payload];
        break;
      case 'OPTIONS_THEMES_SET':
        draftState.themes = { ...draftState.themes, ...action.payload };
        break;
    }
  });
}
