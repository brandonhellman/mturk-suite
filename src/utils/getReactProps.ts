import { getReactEl } from './getReactEl';

export interface ReactPropsCopyText {
  textToCopy: string;
}

export interface ReactPropsPagination {
  currentPage: number;
  lastPage: number;
}

type ReactPropsTypes = ReactPropsCopyText & ReactPropsPagination;

export async function getReactProps(...selectors: string[]): Promise<ReactPropsTypes> {
  const el = await getReactEl(...selectors);
  return JSON.parse(el.dataset.reactProps);
}
