import { sortBy } from 'lodash'
import { useMemo, useState } from 'react'

export default (areaList, alternativeTerms = []) => {
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = useMemo(() => {
    return sortBy([
      ...alternativeTerms.filter(({ alt_name }) => alt_name.toLowerCase.startsWith(searchTerm)),
      ...areaList.filter(({ name }) => name.toLowerCase().startsWith(searchTerm))
    ], 'name')
  }, [searchTerm])

  return {
    isSearching,
    setIsSearching,
    searchTerm,
    setSearchTerm,
    filteredItems
  }
}
