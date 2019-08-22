import { AppState } from '..';

export function selectMturk(state: AppState) {
  return state.mturk;
}
