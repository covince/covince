
import { useMemo } from 'react'

function useAreaLookupTable (tiles, overview) {
  return useMemo(() => {
    const lookupTable = {
      overview: overview.short_text
    }
    if (tiles !== null) {
      for (const feature of tiles.features) {
        lookupTable[feature.properties.area_id] = feature.properties.area_name
      }
    }
    return lookupTable
  }, [tiles, overview])
}

export default useAreaLookupTable
