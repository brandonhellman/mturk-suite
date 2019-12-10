import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

import { ReactPropsHitSetTable } from '../../utils/getReactProps';

import { useBlocksContext } from './BlocksContext';

interface BlocksQuickAddButtonsProps {
  hit: ReactPropsHitSetTable['bodyData'][0];
  reducer: any;
}

function BlocksQuickAddButtons({ hit, reducer }: BlocksQuickAddButtonsProps) {
  return (
    <>
      <button
        type="button"
        className="btn btn-danger btn-sm m-r-xs"
        data-toggle="modal"
        data-target="#blocks-modal"
        onClick={() =>
          reducer({
            view: 'add',
            block: {
              name: hit.requester_name,
              match: hit.requester_id,
              strict: true,
            },
          })
        }
      >
        Block Requester
      </button>
      <button
        type="button"
        className="btn btn-danger btn-sm m-r-xs"
        data-toggle="modal"
        data-target="#blocks-modal"
        onClick={() =>
          reducer({
            view: 'add',
            block: {
              name: hit.title,
              match: hit.title,
              strict: true,
            },
          })
        }
      >
        Block Title
      </button>
      <button
        type="button"
        className="btn btn-danger btn-sm m-r-xs"
        data-toggle="modal"
        data-target="#blocks-modal"
        onClick={() =>
          reducer({
            view: 'add',
            block: {
              name: hit.title,
              match: hit.hit_set_id,
              strict: true,
            },
          })
        }
      >
        Block HIT
      </button>
    </>
  );
}

interface Props {
  el: HTMLElement;
  props: ReactPropsHitSetTable;
}

export default function({ el, props }: Props): null {
  const [, reducer] = useBlocksContext();

  // Loop through each row and add a MutationObserver to each that will inject the quick block buttons.
  useEffect(() => {
    const rows = el.querySelectorAll<HTMLLIElement>('li.hit-set-table-row');

    [...rows].forEach((row, i) => {
      const hit = props.bodyData[i];

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node: any) => {
            if (node.matches('.expanded-row')) {
              const react = document.createElement('react');
              node.append(react);
              ReactDOM.render(<BlocksQuickAddButtons hit={hit} reducer={reducer} />, react);
            }
          });
        });
      });

      observer.observe(row, { childList: true });
    });
  }, []);

  return null;
}
