import { useEffect, useState, useMemo } from 'react'

// import { features } from '../assets/hex.json'

function useTiles () {
  const [tiles, setTiles] = useState(null)

  useEffect(() => {
    import('../assets/Local_Authority_Districts__December_2019__Boundaries_UK_BUC.json')
      .then(result => {
        result.features.reverse()
        setTiles(result)
      })
  }, [])

  return tiles
}

function useLALookupTable (tiles) {
  return useMemo(() => {
    const lookupTable = {
      national: 'National'
    }
    if (tiles !== null) {
      for (const feature of tiles.features) {
        lookupTable[feature.properties.lad19cd] = feature.properties.lad19nm
      }
    }
    return lookupTable
  }, [tiles])
}

export { useTiles, useLALookupTable }
