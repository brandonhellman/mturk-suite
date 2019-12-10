import { AppState } from '..';

export function selectBlocks(state: AppState) {
  return state.blocks;
}
