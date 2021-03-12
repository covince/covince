import 'leaflet/dist/leaflet.css'
import './Chloropleth.css'

import React, { useEffect, useMemo } from 'react'
import { MapContainer, GeoJSON, useMap } from 'react-leaflet'
import classnames from 'classnames'

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

  const gradient = useMemo(() => {
    const stops = []
    for (let i = 0; i <= 100; i++) {
      stops.push(`${scale(dmin + (i / 100) * (dmax - dmin))} ${i}%`)
    }
    return `linear-gradient(to right, ${stops.join(',')})`
  }, [dmin, dmax, scale])

  return (
    <div className='space-y-2'>
      <div className='h-4 rounded-sm' style={{ backgroundImage: gradient }} />
      <div className='grid grid-cols-3 text-xs leading-none'>
        <span>
          {Math.ceil(dmin).toLocaleString()}
        </span>
        <span className='text-center'>
          {midpoint.toLocaleString()}
        </span>
        <span className='text-right'>
          {Math.ceil(dmax).toLocaleString()}
        </span>
      </div>
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
    <div className={classnames(props.className, 'relative flex flex-col')}>
      <MapContainer className='rounded-md flex-grow' zoom={5.5} center={[53.5, -3]}>
        <GeoJSON
          style={mapStyle}
          data={tiles}
          onEachFeature={onEachLad}
        />
        <Map dataframe={props.dataframe} date={props.date} lad={props.lad} scale={scale} />
        <div className='absolute left-0 right-0 top-0 bottom-0 shadow-inner pointer-events-none' style={{ zIndex: 999 }} />
      </MapContainer>
      <div className="p-3 pb-2 bg-white shadow rounded absolute left-2 bottom-2 w-60 z-10">
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
