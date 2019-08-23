import React, { useEffect, useRef } from 'react';

interface Props {
  children: React.ReactNode;
}

export function ReviewButton({ children }: Props) {
  const spanEl = useRef(null);

  useEffect(() => {
    spanEl.current.addEventListener('click', (event: Event) => {
      event.stopImmediatePropagation();
    });
  }, [spanEl]);

  return (
    <span ref={spanEl} className="btn btn-sm btn-default" tabIndex={0}>
      {children}
    </span>
  );
}
