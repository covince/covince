import { useMemo, useReducer } from 'react'
import { orderBy } from 'lodash'
import { useQuery } from 'react-query'

export default (lookupTable, hasSearchTerms, dataPath) => {
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

  const getSearchTerms = async () => {
    const response = await fetch(`${dataPath}/area-search.json`)
    return await response.json()
  }
  const { data: searchTerms, isLoading } = useQuery('searchTerms', getSearchTerms, { enabled: !!hasSearchTerms })

  const searchTermLookup = useMemo(() => {
    const lookup = {}
    if (searchTerms) {
      for (const term of Object.keys(searchTerms)) {
        lookup[term.toLowerCase()] = term
      }
    }
    return lookup
  }, [searchTerms])

  const termsToMatch = useMemo(() => {
    const terms = {}
    if (lookupTable) {
      for (const key of Object.keys(lookupTable)) {
        if (key !== 'overview') {
          terms[lookupTable[key].toLowerCase()] = key
        }
      }
    }
    if (searchTerms) {
      for (const key of Object.keys(searchTerms)) {
        const id = searchTerms[key]
        if (id in lookupTable) {
          terms[key.toLowerCase()] = id
        }
      }
    }
    return terms
  }, [searchTerms, lookupTable])

  const { searchTerm } = state
  const filteredItems = useMemo(() => {
    if (searchTerm.length === 0) return []

    const toMatch = searchTerm.toLowerCase()
    const matchingTerms = Object.keys(termsToMatch).filter(term => term.startsWith(toMatch)).slice(0, 10)

    const idToLabels = {}
    for (const term of matchingTerms) {
      const id = termsToMatch[term]
      const searchTerm = searchTermLookup[term]
      const matchingName = term === lookupTable[id].toLowerCase()
      if (id in idToLabels) {
        if (searchTerm !== undefined && !matchingName) {
          idToLabels[id].terms.push(searchTerm)
        }
        if (matchingName && idToLabels[id].matchingName === false) {
          idToLabels[id].matchingName = true
        }
      } else {
        idToLabels[id] = {
          name: lookupTable[id],
          matchingName,
          terms: searchTerm !== undefined ? [searchTerm] : []
        }
      }
    }

    return orderBy(Object.keys(idToLabels).map(id => ({ ...idToLabels[id], id })), 'name', 'asc')
  }, [searchTerm, termsToMatch])

  return {
    ...state,
    isLoading,
    setIsSearching: isSearching => dispatch({ type: 'IS_SEARCHING', payload: isSearching }),
    setSearchTerm: searchTerm => dispatch({ type: 'SET_SEARCH_TERM', payload: searchTerm }),
    filteredItems
  }
}
