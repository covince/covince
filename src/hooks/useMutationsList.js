import { useEffect, useMemo, useReducer } from 'react'

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

const getLoadingType = (query) => {
  if (query.skip > 0) {
    return 'PAGE'
  }
  return 'LIST'
}

export default (api_url, queryParams, parent, lineages, gene, filter = '', dates) => {
  const { sortColumn, sortAscending, sortBy } = useTableSort('change')

  const [state, dispatch] = useReducer((state, { type, payload }) => {
    switch (type) {
      case 'LOADING': {
        return {
          ...state,
          query: payload.query,
          loading: getLoadingType(payload.query)
        }
      }
      case 'SUCCESS': {
        if (state.query !== payload.query) return state
        return {
          ...state,
          rows: payload.rows,
          total: payload.total,
          denominator: payload.denominator,
          loading: null
        }
      }
      default:
        return state
    }
  }, {
    rows: [],
    total: 0,
    denominator: null,
    query: null,
    loading: null
  })

  const loadMoreItems = async (startIndex = 0, stopIndex, currentRows = state.rows) => {
    if (stopIndex < currentRows.length) return Promise.resolve()

    const query = {
      parent,
      lineages,
      gene,
      filter,
      sort: sortColumn,
      direction: sortAscending ? 'asc' : 'desc',
      skip: startIndex,
      limit: 20,
      growthStart: dates[dates.length - 2],
      growthEnd: dates[dates.length - 1]
    }

    const { area, toDate, fromDate } = queryParams
    if (area) query.area = area
    if (fromDate) query.from = fromDate
    if (toDate) {
      query.to = toDate
      query.growthEnd = toDate
      query.growthStart = dates[dates.indexOf(toDate) - 1]
    }

    dispatch({ type: 'LOADING', payload: { query } })

    const response = await fetch(`${api_url}/mutations?${new URLSearchParams(query).toString()}`)
    const data = await response.json()

    const newRows = data.page.filter(_ => _).map(_ => ({ mutation: _.key, count: _.count, growth: _.growth }))

    dispatch({
      type: 'SUCCESS',
      payload: {
        query,
        rows: [...currentRows, ...newRows],
        total: data.total_rows,
        denominator: data.total_records
      }
    })
  }

  // const isMounted = useRef(false)
  useEffect(() => {
    if (queryParams) {
      loadMoreItems(undefined, undefined, [])
    }
    // isMounted.current = true
  }, [sortColumn, sortAscending, parent, gene, filter, queryParams])

  return [
    {
      ...state,
      sortColumn,
      sortAscending
    },
    {
      loadMoreItems,
      sortBy
    }
  ]
}
