import { BlocksState } from '../store/blocks/types';

export function isHitBlocked(
  hit: {
    hit_set_id: string;
    requester_id: string;
    requester_name: string;
    title: string;
  },
  blocks: BlocksState,
) {
  const check = [hit.hit_set_id, hit.requester_id, hit.requester_name, hit.title];

  return Object.values(blocks).some((block) => {
    return block.strict
      ? check.some((value) => value === block.match)
      : check.some((value) => value.toLowerCase().includes(block.match.toLowerCase()));
  });
}
