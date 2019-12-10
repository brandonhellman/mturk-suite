export const BlocksInitialState: BlocksState = {};

export interface Block {
  name: string;
  match: string;
  strict: boolean;
}

export interface BlocksState {
  [key: string]: Block;
}

export interface BlockCreateAction {
  type: 'BLOCK_CREATE';
  payload: Block;
}

export interface BlockUpdateAction {
  type: 'BLOCK_UPDATE';
  payload: Block;
}

export interface BlockDeleteAction {
  type: 'BLOCK_DELETE';
  payload: Block;
}

export interface BlocksDeleteAllAction {
  type: 'BLOCKS_DELETE_ALL';
}

export interface BlocksImportAction {
  type: 'BLOCKS_IMPORT';
  payload: BlocksState;
}

export type BlocksActionTypes =
  | BlockCreateAction
  | BlockUpdateAction
  | BlockDeleteAction
  | BlocksDeleteAllAction
  | BlocksImportAction;
