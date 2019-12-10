import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';

import { selectBlocks } from '../../store/blocks/selectors';
import { isHitBlocked } from '../../utils/isHitBlocked';
import { ReactPropsHitSetTable } from '../../utils/getReactProps';

interface BlocksHiddenButtonProps {
  count: number;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

function BlocksHiddenButton({ count, show, setShow }: BlocksHiddenButtonProps) {
  return (
    <a href="#" className="table-expand-collapse-button" onClick={() => setShow(!show)}>
      <i className="fa fa-plus-circle"></i>
      <span className="button-text">
        {show ? 'Hide' : 'Show'} Blocked ({count})
      </span>
    </a>
  );
}

interface Props {
  el: HTMLElement;
  props: ReactPropsHitSetTable;
}

export default function({ el, props }: Props) {
  const blocks = useSelector(selectBlocks);
  const [count, setCount] = useState(0);
  const [show, setShow] = useState(false);

  const holder = document.querySelector('.expand-collapse-projects-holder');
  const react = document.createElement('react');
  react.className = 'expand-projects-button';

  // Loop through each row and hide and/or change the background color of each blocked HIT.
  useEffect(() => {
    const rows = el.querySelectorAll<HTMLLIElement>('li.hit-set-table-row');

    const hidden = [...rows].reduce((number, row, i) => {
      const isBlocked = isHitBlocked(props.bodyData[i], blocks);

      if (isBlocked) {
        row.style.display = show ? '' : 'none';
        row.classList.add('bg-danger');
        return number + 1;
      } else {
        row.style.display = '';
        row.classList.remove('bg-danger');
        return number;
      }
    }, 0);

    setCount(hidden);
  }, [blocks, show]);

  // Clean up the portal on each rerender.
  useEffect(() => {
    holder.insertAdjacentElement('afterbegin', react);

    return () => {
      holder.removeChild(react);
    };
  }, [holder, react]);

  return ReactDOM.createPortal(<BlocksHiddenButton count={count} show={show} setShow={setShow} />, react);
}
