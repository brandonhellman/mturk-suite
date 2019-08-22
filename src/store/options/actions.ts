import { OptionsUpdateScriptsAction, OPTIONS_UPDATE_SCRIPTS } from './types';

export function optionsUpdateScripts(payload: OptionsUpdateScriptsAction['payload']): OptionsUpdateScriptsAction {
  return {
    type: OPTIONS_UPDATE_SCRIPTS,
    payload,
  };
}
