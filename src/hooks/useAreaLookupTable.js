
import { useMemo } from 'react'

function useAreaLookupTable (tiles) {
  return useMemo(() => {
    const lookupTable = {
      national: 'National'
    }
    if (tiles !== null) {
      for (const feature of tiles.features) {
        lookupTable[feature.properties.area_id] = feature.properties.area_name
      }
    }
    return lookupTable
  }, [tiles])
}

export default useAreaLookupTable
