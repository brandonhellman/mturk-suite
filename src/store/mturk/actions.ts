import { MturkUpdateAction, MTURK_UPDATE } from './types';

export function mturkUpdate(payload: MturkUpdateAction['payload']): MturkUpdateAction {
  return {
    type: MTURK_UPDATE,
    payload,
  };
}
