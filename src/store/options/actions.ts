import { OptionsScriptsToggleAction } from './types';

export function optionsUpdateScripts(payload: OptionsScriptsToggleAction['payload']): OptionsScriptsToggleAction {
  return {
    type: 'OPTIONS_SCRIPTS_TOGGLE',
    payload,
  };
}
