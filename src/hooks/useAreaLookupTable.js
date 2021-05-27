import { useMemo } from 'react'

function useAreaLookupTable (tiles, ontology) {
  return useMemo(() => {
    const lookupTable = {
      overview: ontology.overview.short_heading
    }
    if (tiles !== null) {
      for (const feature of tiles.features) {
        lookupTable[feature.properties.area_id] = feature.properties.area_name
      }
    }
    return lookupTable
  }, [tiles, ontology.overview])
}

export default useAreaLookupTable
