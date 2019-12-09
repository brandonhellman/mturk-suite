import { OptionsScriptsToggleAction, OptionsThemesSetAction } from './types';

export function optionsScriptsToggle(payload: OptionsScriptsToggleAction['payload']): OptionsScriptsToggleAction {
  return {
    type: 'OPTIONS_SCRIPTS_TOGGLE',
    payload,
  };
}

export function optionsThemesSet(payload: OptionsThemesSetAction['payload']) {
  return {
    type: 'OPTIONS_THEMES_SET',
    payload,
  };
}
