import produce from 'immer';

import { BlocksInitialState, BlocksActionTypes } from './types';

export function blocksReducer(state = BlocksInitialState, action: BlocksActionTypes) {
  return produce(state, (draftState) => {
    switch (action.type) {
      case 'BLOCK_CREATE':
      case 'BLOCK_UPDATE':
        draftState[action.payload.match] = action.payload;
        break;
      case 'BLOCK_DELETE':
        delete draftState[action.payload.match];
        break;
      case 'BLOCKS_DELETE_ALL':
        Object.keys(state).forEach((key) => {
          delete draftState[key];
        });
        break;
      case 'BLOCKS_IMPORT':
        Object.entries(action.payload).forEach(([key, value]) => {
          draftState[key] = value;
        });
        break;
    }
  });
}
