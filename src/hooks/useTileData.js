import { useMemo } from 'react'

function useTileData (tiles, results, ontology) {
  const normalisedTiles = useMemo(() => {
    return {
      ...tiles,
      features: tiles.features.map(f => {
        const {
          area_id,
          area_name = area_id,
          area_description = area_id
        } = f.properties

        return {
          ...f,
          properties: {
            ...f.properties,
            area_id,
            area_name,
            area_description
          }
        }
      })
    }
  }, [tiles])

  const tileIndex = useMemo(() => {
    const lookupTable = {
      overview: ontology.overview.short_heading
    }

    if (results === null) {
      return lookupTable
    }

    const tileLookup = {}
    if (normalisedTiles !== null) {
      for (const feature of normalisedTiles.features) {
        tileLookup[feature.properties.area_id] = feature.properties
      }
    }

    for (const { area } of results.values) {
      if (area in tileLookup) {
        lookupTable[area] = tileLookup[area]
      }
    }

    return lookupTable
  }, [normalisedTiles, results, ontology.overview])

  return { tileIndex, normalisedTiles }
}

export default useTileData
