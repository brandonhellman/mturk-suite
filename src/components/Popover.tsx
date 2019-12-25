import React, { useEffect, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';

interface PopoverProps {
  content: React.ReactElement;
  icon: React.ReactElement;
  title?: string;
}

export default function Popover({ content, icon, title }: PopoverProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const scriptRef = useRef<HTMLScriptElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.textContent = `$(document.currentScript).parent().popover({
      html: true,
      trigger: 'hover focus',
      title: '${title}',
      content: '${ReactDOMServer.renderToString(content)}'
    });`;
    scriptRef.current.replaceWith(script);
  }, []);

  useEffect(() => {
    spanRef.current.addEventListener('click', (event) => {
      event.stopImmediatePropagation();
    });
  }, [spanRef]);

  return (
    <span className="btn btn-sm btn-default" tabIndex={0} ref={spanRef}>
      {icon}
      <script ref={scriptRef} />
    </span>
  );
}
