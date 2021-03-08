import React, { useEffect, useMemo } from 'react'
import { MapContainer, GeoJSON, useMap } from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import './Chloropleth.css'
import { getColorScale } from '../utils/loadTiles'

const Map = (props) => {
  const map = useMap()

  const { dataframe, date, lad, scale } = props

  useEffect(() => {
    const { dataframe, date, lad, scale } = props

    if (dataframe === null) return

    const by_loc = dataframe[date].getSeries('mean')
    if (map === undefined) {
      return true
    }
    for (const i in map._layers) {
      const layer = map._layers[i]
      if (layer.setStyle && layer.feature) {
        let fillColor = null

        const item = by_loc.getRowByIndex(layer.feature.properties.lad19cd)

        fillColor = typeof item !== 'undefined' ? scale(item) : '#ffffff'

        layer.setStyle({ fillColor: fillColor })

        if (layer.feature.properties.lad19cd === lad) {
          // layer.setStyle({ 'stroke-width': "5" })
          layer.setStyle({
            color: 'black',
            weight: 2
          })
          layer.bringToFront()
        } else {
          layer.setStyle({
            color: '#333333',
            weight: 0.5,
            zIndex: 0
          })
        }
      }
    }

    return false
  }, [dataframe, date, scale, lad])

  return null
}

const ColourBar = ({ dmin, dmax, scale }) => {
  let midpoint
  if (dmax > 2) {
    midpoint = Math.ceil((dmin + dmax) * 0.5)
  } else {
    midpoint = Math.round(10 * (dmin + dmax) * 0.5) / 10
  }

  const colours = useMemo(() => {
    const memo = []
    for (let i = 0; i <= 100; i++) {
      memo.push(scale(dmin + (i / 100) * (dmax - dmin)))
    }
    return memo
  }, [dmin, dmax, scale])

  return (
    <div>
      {colours.map((backgroundColor, i) =>
        <span
          key={`${i}`}
          className="grad-step"
          style={{ backgroundColor }}
        ></span>
      )}
      <span key="domain-min" className="domain-min">
        {Math.ceil(dmin)}
      </span>
      <span key="domain-med" className="domain-med">
        {midpoint}
      </span>
      <span key="domain-max" className="domain-max">
        {Math.ceil(dmax)}
      </span>
    </div>
  )
}

const Chloropleth = (props) => {
  const { color_scale_type, tiles, handleOnClick, min_val, max_val } = props

  const scale = useMemo(() => {
    return getColorScale(props.min_val, props.max_val, props.color_scale_type)
  }, [min_val, max_val, color_scale_type])

  const mapStyle = {
    fillColor: 'white',
    weight: 0.5,
    color: '#333333',
    fillOpacity: 1
  }

  const onEachLad = async (lad, layer) => {
    const name = lad.properties.lad19nm
    const code = lad.properties.lad19cd

    // layer.options.fillColor =
    //   typeof item !== "undefined" ? await colorScale(data, item) : "#ffffff";

    layer.bindTooltip(`${name}`, {
      direction: 'top'
    })
    layer.on({
      click: (e) => handleOnClick(e, code)
    })
  }

  return (
    <div>
      <MapContainer style={{ height: '60vh' }} zoom={5.5} center={[53.5, -3]}>
        <GeoJSON
          style={mapStyle}
          data={tiles}
          onEachFeature={onEachLad}
          // eventHandlers={{
          //   add: () => console.log('stuff')
          // }}
        />
        <Map dataframe={props.dataframe} date={props.date} lad={props.lad} scale={scale} />
      </MapContainer>
      <div className="gradient">
        <ColourBar
          dmin={min_val}
          dmax={max_val}
          scale={scale}
        />
      </div>
    </div>
  )
}

export default Chloropleth
