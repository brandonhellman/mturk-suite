import ReactDOMServer from 'react-dom/server';

export function injectReviewPopover(
  ref: React.MutableRefObject<HTMLScriptElement>,
  rid: string,
  rname: string,
  content: React.ReactElement,
) {
  const script = document.createElement('script');
  script.textContent = `$(document.currentScript).parent().popover({
    html: true,
    trigger: 'hover focus',
    title: '${rname} [${rid}]',
    content: '${ReactDOMServer.renderToString(content)}'
  });`;
  ref.current.replaceWith(script);
}
