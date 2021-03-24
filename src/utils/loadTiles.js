import geojson from '../assets/Local_Authority_Districts__December_2019__Boundaries_UK_BUC.json' // Can change to BUC to reduce bundle size
geojson.features.reverse()
// import { features } from '../assets/hex.json' // Can change to BUC to reduce bundle size


function loadTiles() {
  return geojson
}

function getLALookupTable() {
  const lookupTable = {
    national: 'National'
  }

  geojson.features.forEach((item) => {
    lookupTable[item.properties.lad19cd] = item.properties.lad19nm
  })
  return (lookupTable)
}

export { loadTiles, getLALookupTable }
