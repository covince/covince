import { sortBy } from 'lodash'
import { useMemo, useReducer } from 'react'

export default (areaList, alternativeTerms = []) => {
  const [state, dispatch] = useReducer((state, action) => {
    if (action.type === 'IS_SEARCHING') {
      return {
        isSearching: action.payload,
        searchTerm: ''
      }
    }
    if (action.type === 'SET_SEARCH_TERM') {
      return {
        ...state,
        searchTerm: action.payload
      }
    }
    return state
  }, {
    isSearching: false,
    searchTerm: ''
  })

  const { searchTerm } = state
  const filteredItems = useMemo(() => {
    return sortBy([
      ...alternativeTerms.filter(({ alt_name }) => alt_name.toLowerCase.startsWith(searchTerm)),
      ...areaList.filter(({ name }) => name.toLowerCase().startsWith(searchTerm))
    ], 'name')
  }, [searchTerm])

  return {
    ...state,
    setIsSearching: isSearching => dispatch({ type: 'IS_SEARCHING', payload: isSearching }),
    setSearchTerm: searchTerm => dispatch({ type: 'SET_SEARCH_TERM', payload: searchTerm }),
    filteredItems
  }
}
