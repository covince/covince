import { useMemo, useReducer } from 'react'
import { useQuery } from 'react-query'

export default (lookupTable, searchTermConfig = {}) => {
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
    const response = await fetch(searchTermConfig.url)
    return await response.json()
  }
  const { data: searchTerms, isLoading } = useQuery('searchTerms', getSearchTerms, { enabled: !!searchTermConfig.url })

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
    const terms = []
    if (lookupTable) {
      for (const key of Object.keys(lookupTable)) {
        if (key !== 'overview') {
          terms.push({ term: lookupTable[key].toLowerCase(), id: key })
        }
      }
    }
    if (searchTerms) {
      for (const key of Object.keys(searchTerms)) {
        const id = searchTerms[key]
        if (id in lookupTable) {
          terms.push({ term: key.toLowerCase(), id, mode: searchTermConfig.mode })
        }
      }
    }
    return terms
  }, [searchTerms, lookupTable])

  const { searchTerm } = state
  const filteredItems = useMemo(() => {
    if (searchTerm.length === 0) return []

    const input = searchTerm.toLowerCase()
    const matchingTerms = []
    const ids = new Set()
    for (const { term, id, mode } of termsToMatch) {
      let matchIndex = null
      if (mode === 'padded-first-input-token') {
        const paddedInput = input.split(' ')[0].padEnd(input.length)
        const paddedTerm = term.padEnd(input.length)
        if (paddedTerm.startsWith(paddedInput)) {
          matchIndex = 0
        }
      } else {
        const tokens = term.split(' ')
        for (const t of tokens) {
          if (t.startsWith(input) || (input.startsWith(t) && term.includes(input))) {
            matchIndex = term.indexOf(t)
            break
          }
        }
      }
      if (matchIndex !== null) {
        matchingTerms.push({ term, id, matchIndex })
        ids.add(id)
      }
      if (ids.size === 10) break
    }

    const matchesById = {}
    for (const { term, id, matchIndex } of matchingTerms) {
      const searchTerm = searchTermLookup[term]
      const isNameMatch = term === lookupTable[id].toLowerCase()
      if (id in matchesById) {
        if (isNameMatch) {
          matchesById[id] = {
            ...matchesById[id],
            isNameMatch,
            matchIndex
          }
        } else {
          matchesById[id].terms.push({ term: searchTerm, matchIndex })
        }
      } else {
        matchesById[id] = {
          name: lookupTable[id],
          isNameMatch,
          matchIndex: isNameMatch ? matchIndex : undefined,
          terms: isNameMatch ? [] : [{ term: searchTerm, matchIndex }]
        }
      }
    }

    const collator = new Intl.Collator(undefined, { numeric: true })
    const nameEntries = []
    const termEntries = []
    for (const id of Object.keys(matchesById)) {
      const entry = matchesById[id]
      entry.terms.sort(collator.compare)
      const list = entry.isNameMatch ? nameEntries : termEntries
      list.push({ ...entry, id })
    }
    nameEntries.sort((a, b) => collator.compare(a.name, b.name))
    termEntries.sort((a, b) => collator.compare(a.terms[0], b.terms[0]))

    return [...nameEntries, ...termEntries]
  }, [searchTerm, termsToMatch])

  return {
    ...state,
    isLoading,
    setIsSearching: isSearching => dispatch({ type: 'IS_SEARCHING', payload: isSearching }),
    setSearchTerm: searchTerm => dispatch({ type: 'SET_SEARCH_TERM', payload: searchTerm }),
    filteredItems
  }
}
