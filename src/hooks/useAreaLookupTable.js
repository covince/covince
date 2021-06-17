import { useMemo } from 'react'

function useAreaLookupTable (tiles, results, ontology) {
  return useMemo(() => {
    const lookupTable = {
      overview: ontology.overview.short_heading
    }

    if (results === null) {
      return lookupTable
    }

    const nameLookup = {}
    if (tiles !== null) {
      for (const feature of tiles.features) {
        nameLookup[feature.properties.area_id] = feature.properties.area_name
      }
    }

    for (const { area } of results.values) {
      if (area in nameLookup) {
        lookupTable[area] = nameLookup[area]
      }
    }

    return lookupTable
  }, [tiles, results, ontology.overview])
}

export default useAreaLookupTable
