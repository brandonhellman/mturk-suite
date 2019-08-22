export interface OptionsState {
  scripts: {
    confirmReturnHit: boolean;
    rateLimitReloader: boolean;
  };
}

export const OPTIONS_UPDATE_SCRIPTS = 'OPTIONS_UPDATE_SCRIPTS';

export interface OptionsUpdateScriptsAction {
  type: typeof OPTIONS_UPDATE_SCRIPTS;
  payload: {
    key: 'confirmReturnHit' | 'rateLimitReloader';
    value: boolean;
  };
}

export type OptionsActionTypes = OptionsUpdateScriptsAction;
