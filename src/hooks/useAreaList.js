import { useMemo } from 'react'
import { orderBy } from 'lodash'

function useAreaLookupTable (results, lookupTable) {
  return useMemo(() => {
    const list = []

    if (results === null) {
      return list
    }

    for (const { area } of results.values) {
      list.push({ id: area, name: lookupTable[area] })
    }

    return orderBy(list, 'name', 'asc')
  }, [lookupTable, results])
}

export default useAreaLookupTable
