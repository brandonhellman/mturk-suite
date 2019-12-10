import {
  BlockCreateAction,
  BlockUpdateAction,
  BlockDeleteAction,
  BlocksDeleteAllAction,
  BlocksImportAction,
} from './types';

export function blockCreate(payload: BlockCreateAction['payload']): BlockCreateAction {
  return {
    type: 'BLOCK_CREATE',
    payload,
  };
}

export function blockUpdate(payload: BlockUpdateAction['payload']): BlockUpdateAction {
  return {
    type: 'BLOCK_UPDATE',
    payload,
  };
}

export function blockDelete(payload: BlockDeleteAction['payload']): BlockDeleteAction {
  return {
    type: 'BLOCK_DELETE',
    payload,
  };
}

export function blocksDeleteAll(): BlocksDeleteAllAction {
  return {
    type: 'BLOCKS_DELETE_ALL',
  };
}

export function blocksImport(payload: BlocksImportAction['payload']): BlocksImportAction {
  return {
    type: 'BLOCKS_IMPORT',
    payload,
  };
}
