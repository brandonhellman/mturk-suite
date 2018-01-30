/* globals mturkReact scriptEnabled */

(async function () {
  const enabled = await scriptEnabled(`paginationLastPage`)
  if (!enabled) return

  const react = await mturkReact(`reactComponents/navigation/Pagination`)
  const reactProps = await react.getProps()
  const lastPage = reactProps.lastPage

  if (lastPage > reactProps.currentPage + 2) {
    const searchParams = new window.URLSearchParams(window.location.search)
    searchParams.set(`page_number`, lastPage)

    const pageItem = document.createElement(`li`)
    pageItem.className = `page-item`

    const pageLink = document.createElement(`a`)
    pageLink.href = `${window.location.pathname}?${searchParams}`
    pageLink.className = `page-link btn btn-secondary btn-small`
    pageLink.textContent = lastPage
    pageItem.appendChild(pageLink)

    const reactElement = await react.getElement()

    const ellipsis = reactElement.getElementsByClassName(`pagination-ellipsis`)
    const lastEllipsis = ellipsis[ellipsis.length - 1]

    lastEllipsis.parentNode.insertBefore(pageItem, lastEllipsis.nextSibling)
  }
})()
