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

export default (api_url, lineage, gene, filter = '', totalRows) => {
  const { sortColumn, sortAscending, sortBy } = useTableSort('count')
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const loadMoreItems = async (startIndex = 0, stopIndex, currentRows = rows) => {
    if (stopIndex < currentRows.length || totalRows === 0) return Promise.resolve()
    setIsLoading(true)
    const query = new URLSearchParams({
      lineage,
      sort: sortColumn,
      direction: sortAscending ? 'asc' : 'desc',
      search: gene ? gene + ':' + filter : '',
      skip: startIndex,
      limit: 15
    })
    const response = await fetch(`${api_url}/mutations?${query.toString()}`)
    const data = await response.json()
    const newRows = Object.entries(data).map(([mutation, count]) => ({ mutation, count }))
    setRows([...currentRows, ...newRows])
    setIsLoading(false)
  }

  const isMounted = useRef(false)
  useEffect(() => {
    if (isMounted.current) {
      loadMoreItems(undefined, undefined, [])
    }
    isMounted.current = true
  }, [sortColumn, sortAscending, gene, filter])

  return [
    {
      rows,
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
