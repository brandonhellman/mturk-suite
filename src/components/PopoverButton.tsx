import React, { useEffect, useRef } from 'react';

interface Props {
  children: any;
}

export function PopoverButton({ children }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    ref.current.addEventListener('click', (event) => {
      event.stopImmediatePropagation();
    });
  }, [ref]);

  return (
    <span ref={ref} className="btn btn-sm btn-default" tabIndex={0}>
      {children}
    </span>
  );
}
