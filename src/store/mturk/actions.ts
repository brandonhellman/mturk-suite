import { MturkUpdateAction } from './types';

export function mturkUpdate(payload: MturkUpdateAction['payload']): MturkUpdateAction {
  return {
    type: 'MTURK_UPDATE',
    payload,
  };
}
