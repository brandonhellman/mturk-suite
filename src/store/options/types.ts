export interface OptionsState {
  scripts: {
    confirmReturnHit: boolean;
    paginationLastPage: boolean;
    rateLimitReloader: boolean;
    turkerview: boolean;
    turkopticon: boolean;
  };
}

export const OPTIONS_UPDATE_SCRIPTS = 'OPTIONS_UPDATE_SCRIPTS';

export interface OptionsUpdateScriptsAction {
  type: typeof OPTIONS_UPDATE_SCRIPTS;
  payload: {
    key: 'confirmReturnHit' | 'paginationLastPage' | 'rateLimitReloader' | 'turkerview' | 'turkopticon';
    value: boolean;
  };
}

export type OptionsActionTypes = OptionsUpdateScriptsAction;
