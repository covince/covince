import React from 'react'

import geojson from '../assets/Local_Authority_Districts__December_2019__Boundaries_UK_BUC.json'
geojson.features.reverse()

const TileProvider =
  ({ children }) => React.cloneElement(children, { tiles: geojson })

export default TileProvider
