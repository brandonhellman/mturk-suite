async function paginationLastPage() {
  const [dom, props] = await Promise.all([
    ReactDOM(`Pagination`),
    ReactProps(`Pagination`),
    Enabled(`paginationLastPage`)
  ]);

  if (props) {
    const { lastPage, currentPage } = props;

    if (lastPage > currentPage + 2) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set(`page_number`, lastPage);

      dom.querySelector(`.pagination > :last-child`).insertAdjacentHTML(
        `beforebegin`,
        HTML`<li class="page-item">
          <a href="${window.location.origin}${window.location.pathname}?${searchParams}" class="page-link btn btn-secondary btn-small">${lastPage}</a>
        </li>`
      );
    }
  }
}

paginationLastPage();
