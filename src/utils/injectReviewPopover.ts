import ReactDOMServer from 'react-dom/server';

export function injectReviewPopover(
  ref: React.MutableRefObject<HTMLScriptElement>,
  requester_id: string,
  requester_name: string,
  content: React.ReactElement,
) {
  const script = document.createElement('script');
  script.textContent = `$(document.currentScript).parent().popover({
    html: true,
    trigger: 'hover focus',
    title: '${requester_name} [${requester_id}]',
    content: '${ReactDOMServer.renderToString(content)}'
  });`;
  ref.current.replaceWith(script);
}
