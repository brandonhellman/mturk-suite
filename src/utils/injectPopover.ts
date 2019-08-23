import ReactDOMServer from 'react-dom/server';

export function injectPopover(
  ref: React.MutableRefObject<HTMLScriptElement>,
  title: string,
  content: React.ReactElement,
) {
  const script = document.createElement('script');
  script.textContent = `$(document.currentScript).parent().popover({
    html: true,
    trigger: 'hover focus',
    title: '${title}',
    content: '${ReactDOMServer.renderToString(content)}'
  });`;
  ref.current.replaceWith(script);
}
