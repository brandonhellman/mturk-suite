(async () => {
    await ready({ enabled: `paginationLastPage` });
    
    const react = await require(`reactComponents/navigation/Pagination`);    
    const props = react.reactProps;
    const lastPage = props.lastPage;

    if (lastPage > props.currentPage + 2) {
        const searchParams = new URLSearchParams(location.search);
        searchParams.set(`page_number`, lastPage);
        
        const pageItem = document.createElement(`li`);
        pageItem.className = `page-item`;

        const pageLink = document.createElement(`a`);
        pageLink.href = `${location.pathname}?${searchParams}`;
        pageLink.className = `page-link btn btn-secondary btn-small`;
        pageLink.textContent = lastPage;
        pageItem.appendChild(pageLink);

        await ready({ document: `complete` });
        
        const ellipsis = react.element.getElementsByClassName(`pagination-ellipsis`);
        const lastEllipsis = ellipsis[ellipsis.length - 1];
        
        lastEllipsis.parentNode.insertBefore(pageItem, lastEllipsis.nextSibling);
    }
})();