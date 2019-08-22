import { Store } from 'webext-redux';

import { selectOptions } from '../store/options/selectors';
import { getReactEl } from '../utils/getReactEl';
import { getReactProps, ReactPropsPagination } from '../utils/getReactProps';
import { htmlEscape } from '../utils/htmlEscape';

const store = new Store();

store.ready().then(async () => {
  const options = selectOptions(store.getState());

  if (!options.scripts.paginationLastPage) {
    return;
  }

  const el = await getReactEl('Pagination');
  const { lastPage, currentPage }: ReactPropsPagination = await getReactProps('Pagination');

  if (lastPage > currentPage + 2) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('page_number', lastPage.toString());

    el.querySelector('.pagination > :last-child').insertAdjacentHTML(
      'beforebegin',
      htmlEscape`<li class="page-item">
        <a href="${window.location.origin}${window.location.pathname}?${searchParams}" class="page-link btn btn-secondary btn-small">${lastPage}</a>
      </li>`,
    );
  }
});
