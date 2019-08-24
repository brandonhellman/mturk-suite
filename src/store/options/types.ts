export const OptionsInitialState = {
  scripts: {
    autoAcceptUnchecker: true,
    blockList: true,
    confirmReturnHit: true,
    hitExporter: true,
    mtsHitTracker: true,
    paginationLastPage: true,
    queueInfoEnhancer: true,
    rateLimitReloader: true,
    turkerview: true,
    turkopticon: true,
    workspaceExpander: true,
  },
};

export type OptionsState = typeof OptionsInitialState;

export interface OptionsScriptsToggleAction {
  type: 'OPTIONS_SCRIPTS_TOGGLE';
  payload: keyof OptionsState['scripts'];
}

export type OptionsActionTypes = OptionsScriptsToggleAction;
