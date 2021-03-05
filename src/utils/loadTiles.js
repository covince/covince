import { features } from '../assets/Local_Authority_Districts__December_2019__Boundaries_UK_BGC.json' // Can change to BUC to reduce bundle size
// import { features } from "../assets/hex.json" // Can change to BUC to reduce bundle size

import colormap from 'colormap'
// let colormap = require('colormap')

function getColorScale (dmin, dmax, colorScaleType) {
  // dmin=0
  // dmax = 200

  console.log('GCS')

  const nshades = 4000

  const colors = colormap({
    colormap: 'magma',
    nshades: nshades,
    format: 'hex',
    alpha: 1
  }).reverse()

  const scale = function (number) {
    if (number > dmax) { number = dmax - 1 }
    let dmaxVal, dminVal, numberVal

    if (colorScaleType === 'quadratic') {
      dmaxVal = Math.sqrt(dmax)
      dminVal = Math.sqrt(dmin)
      numberVal = Math.sqrt(number)
    } else {
      dmaxVal = dmax
      dminVal = dmin
      numberVal = number
    }

    // console.log("scale",)
    const portionOfScaleToUse = 0.9 // don't go to deep black
    return (colors[Math.round(portionOfScaleToUse * nshades * (numberVal - dminVal) / (dmaxVal - dminVal))])
  }
  return scale
}

function loadTiles () {
  return features
}

function getLALookupTable () {
  const lookupTable = {}

  features.forEach((item) => {
    lookupTable[item.properties.lad19cd] = item.properties.lad19nm
  })
  return (lookupTable)
}

export { loadTiles, getColorScale, getLALookupTable }
