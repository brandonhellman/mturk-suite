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
  themes: {
    mts: 'default',
    mturk: 'default',
  },
};

export interface OptionsState {
  scripts: {
    autoAcceptUnchecker: boolean;
    blockList: boolean;
    confirmReturnHit: boolean;
    hitExporter: boolean;
    mtsHitTracker: boolean;
    paginationLastPage: boolean;
    queueInfoEnhancer: boolean;
    rateLimitReloader: boolean;
    turkerview: boolean;
    turkopticon: boolean;
    workspaceExpander: boolean;
  };
  themes: {
    mts:
      | 'default'
      | 'cerulean'
      | 'cosmo'
      | 'cyborg'
      | 'darkly'
      | 'flatly'
      | 'journal'
      | 'litera'
      | 'lumen'
      | 'lux'
      | 'materia'
      | 'minty'
      | 'pulse'
      | 'sandstone'
      | 'simplex'
      | 'sketchy'
      | 'slate'
      | 'solar'
      | 'spacelab'
      | 'superhero'
      | 'united'
      | 'yeti';
    mturk: 'default';
  };
}

export interface OptionsScriptsToggleAction {
  type: 'OPTIONS_SCRIPTS_TOGGLE';
  payload: keyof OptionsState['scripts'];
}

export interface OptionsThemesSetAction {
  type: 'OPTIONS_THEMES_SET';
  payload: Partial<OptionsState['themes']>;
}

export type OptionsActionTypes = OptionsScriptsToggleAction | OptionsThemesSetAction;
