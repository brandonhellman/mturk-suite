import { AppState } from '..';

export function selectOptions(state: AppState) {
  return state.options;
}
