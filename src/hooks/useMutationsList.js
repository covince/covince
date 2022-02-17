import { useEffect, useState, useRef, useMemo } from 'react'

import useQueryAsState from './useQueryAsState'

const useTableSort = (defaultSort) => {
  const [{ sort, asc }, updateQuery] = useQueryAsState({ sort: defaultSort })

  const sortAscending = useMemo(() => asc === '1', [asc])

  return {
    sortColumn: sort,
    sortAscending,
    sortBy: column => {
      updateQuery({
        sort: column,
        asc: column === sort && asc === undefined ? '1' : undefined
      }, 'replace')
    }
  }
}

export default (api_url, queryParams, lineage, gene, filter = '') => {
  const { sortColumn, sortAscending, sortBy } = useTableSort('count')
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const loadMoreItems = async (startIndex = 0, stopIndex, currentRows = rows) => {
    if (stopIndex < currentRows.length) return Promise.resolve()
    setIsLoading(true)
    const query = new URLSearchParams({
      lineage,
      sort: sortColumn,
      direction: sortAscending ? 'asc' : 'desc',
      search: gene ? gene + ':' + filter : '',
      skip: startIndex,
      limit: 15
    })

    const { area, toDate, fromDate } = queryParams
    if (area) query.append('area', area)
    if (toDate) query.append('to', toDate)
    if (fromDate) query.append('from', fromDate)

    const response = await fetch(`${api_url}/mutations?${query.toString()}`)
    const data = await response.json()

    const newRows = data.page.filter(_ => _).map(_ => ({ mutation: _.key, count: _.count }))
    setRows([...currentRows, ...newRows])
    setTotal(data.total)
    setIsLoading(false)
  }

  const isMounted = useRef(false)
  useEffect(() => {
    if (isMounted.current && queryParams) {
      loadMoreItems(undefined, undefined, [])
    }
    isMounted.current = true
  }, [sortColumn, sortAscending, gene, filter, queryParams])

  return [
    {
      rows,
      total,
      isLoading,
      sortColumn,
      sortAscending
    },
    {
      loadMoreItems,
      sortBy
    }
  ]
}
