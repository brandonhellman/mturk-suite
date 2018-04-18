async function PAGINATION_LAST_PAGE() {
  const R = new React(`reactComponents/navigation/Pagination`);
  const { lastPage, currentPage } = await R.props;

  if (currentPage + 2 < lastPage) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(`page_number`, lastPage);

    const pageItem = document.createElement(`li`);
    pageItem.className = `page-item`;

    const pageLink = document.createElement(`a`);
    pageLink.href = `${window.location.pathname}?${searchParams}`;
    pageLink.className = `page-link btn btn-secondary btn-small`;
    pageLink.textContent = lastPage;
    pageItem.appendChild(pageLink);

    const ellipsis = (await R.element).getElementsByClassName(`pagination-ellipsis`);
    const lastEllipsis = ellipsis[ellipsis.length - 1];

    lastEllipsis.parentNode.insertBefore(pageItem, lastEllipsis.nextSibling);
  }
}

new Script(PAGINATION_LAST_PAGE, `paginationLastPage`).run();
