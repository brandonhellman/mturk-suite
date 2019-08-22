export function getReactEl(...selectors: string[]): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const el = selectors.map((selector) => document.querySelector(`[data-react-class*="${selector}"]`)).find(Boolean);

    if (el) {
      window.requestAnimationFrame(() => resolve(el as HTMLElement));
    } else {
      reject(new Error(`Unable to find "${selectors}".`));
    }
  });
}
