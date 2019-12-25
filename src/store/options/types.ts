export const OptionsInitialState: OptionsState = {
  scripts: {
    autoAcceptUnchecker: true,
    blocks: true,
    confirmReturnHit: true,
    hitTracker: true,
    paginationLastPage: true,
    projectShare: true,
    queueInfoEnhancer: true,
    rateLimitReloader: true,
    requesterInfo: true,
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
    blocks: boolean;
    confirmReturnHit: boolean;
    hitTracker: boolean;
    paginationLastPage: boolean;
    projectShare: boolean
    queueInfoEnhancer: boolean;
    rateLimitReloader: boolean;
    requesterInfo: boolean
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
