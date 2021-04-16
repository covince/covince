import { useMemo } from 'react'

function useLALookupTable (tiles) {
  return useMemo(() => {
    const lookupTable = {
      national: 'National'
    }
    if (tiles !== null) {
      for (const feature of tiles.features) {
        lookupTable[feature.properties.lad19cd] = feature.properties.lad19cd
      }
    }
    return lookupTable
  }, [tiles])
}

export default useLALookupTable
