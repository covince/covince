import 'leaflet/dist/leaflet.css'
import './Chloropleth.css'

import React, { useState, useMemo } from 'react'
import classnames from 'classnames'
import * as tailwindColors from 'tailwindcss/colors'
import ReactMapGL, { NavigationControl } from 'react-map-gl'
import Measure from 'react-measure'

import FadeTransition from './FadeTransition'

// magma
const colorStops = [
  { index: 0, rgb: 'rgb(0, 0, 4)' },
  { index: 0.13, rgb: 'rgb(28, 16, 68)' },
  { index: 0.25, rgb: 'rgb(79, 18, 123)' },
  { index: 0.38, rgb: 'rgb(129, 37, 129)' },
  { index: 0.5, rgb: 'rgb(181, 54, 122)' },
  { index: 0.63, rgb: 'rgb(229, 80, 100)' },
  { index: 0.75, rgb: 'rgb(251, 135, 97)' },
  { index: 0.88, rgb: 'rgb(254, 194, 135)' },
  { index: 1, rgb: 'rgb(252, 253, 191)' }
]

const quadColorStops =
  colorStops.map(_ => ({ rgb: _.rgb, index: Math.sqrt(_.index) }))

const ColourBar = ({ dmin, dmax, scale, type }) => {
  let midpoint
  if (dmax > 2) {
    midpoint = Math.ceil((dmin + dmax) * 0.5)
  } else {
    midpoint = Math.round(10 * (dmin + dmax) * 0.5) / 10
  }

  const gradient = useMemo(() => {
    const stops = []
    for (let i = 0; i < scale.length; i += 2) {
      const value = scale[i]
      const color = scale[i + 1]
      const range =
        type === 'quadratic'
          ? Math.sqrt(dmax) - Math.sqrt(dmin)
          : dmax - dmin
      const percent = value / range * 100
      stops.push(`${color} ${percent}%`)
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
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    // latitude: 53.5,
    // longitude: -3,
    latitude: 52.561928,
    longitude: -1.464854,
    zoom: props.isMobile ? 4.5 : 5
  })

  const { tiles, date, index, lad } = props

  const data = useMemo(() => {
    if (tiles === null || index === null) {
      return null
    }

    const features = tiles.features.map(f => {
      const { lad19cd } = f.properties
      const values = index[lad19cd]
      const value = values ? values[date] : undefined
      return {
        ...f,
        properties: {
          ...f.properties,
          value,
          selected: lad19cd === lad
        }
      }
    })

    return {
      ...tiles,
      features
    }
  }, [tiles, date, index, lad])

  const { color_scale_type, min_val, max_val } = props

  const colorScale = useMemo(() => {
    if (max_val === 0) {
      return [0, '#fff']
    }
    const scale = []

    const range = color_scale_type === 'quadratic'
      ? Math.sqrt(max_val) - Math.sqrt(min_val)
      : max_val - min_val

    const stops = color_scale_type === 'quadratic'
      ? quadColorStops
      : colorStops

    for (const { index, rgb } of stops) {
      scale.unshift(rgb)
      scale.unshift(range * (1 - index))
    }

    return scale
  }, [max_val, min_val, color_scale_type])

  const { lineColor = 'blueGray' } = props

  const mapStyle = useMemo(() => ({
    version: 8,
    sources: {
      lads: {
        type: 'geojson',
        data
      }
    },
    layers: [
      {
        id: 'lads-fill',
        type: 'fill',
        source: 'lads',
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'value'], null],
            '#fff',
            [
              'interpolate',
              ['linear'],
              color_scale_type === 'quadratic'
                ? ['sqrt', ['get', 'value']]
                : ['get', 'value'],
              ...colorScale
            ]
          ]
          // 'fill-color-transition': { duration: 150 }
        }
      },
      {
        id: 'lads-line',
        type: 'line',
        source: 'lads',
        paint: {
          'line-color': [
            'case',
            ['get', 'selected'],
            tailwindColors[lineColor][900],
            tailwindColors[lineColor][600]
          ],
          // 'line-color-transition': { duration: 300 },
          'line-width': [
            'case',
            ['get', 'selected'],
            2,
            0.5
          ]
        }
      }
    ]
  }), [data, colorScale, color_scale_type])

  return (
    <Measure
      bounds
      onResize={rect => {
        setViewport({
          ...viewport,
          width: rect.bounds.width,
          height: rect.bounds.height
        })
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} className={classnames(props.className, 'relative')}>
          <ReactMapGL
            {...viewport}
            disableTokenWarning
            attributionControl={false}
            onViewportChange={nextViewport => setViewport(nextViewport)}
            mapStyle={mapStyle}
            mapboxApiUrl={null}
            className='bg-gray-200 md:rounded-md'
            interactiveLayerIds={['lads-fill']}
            onNativeClick={e => { // faster for some reason
              const [feature] = e.features
              if (feature) {
                props.handleOnClick(feature.properties.lad19cd)
              }
            }}
          >
            <NavigationControl className='right-2 top-2' showCompass={false} />
            <div className='absolute inset-0 md:rounded-md shadow-inner pointer-events-none' style={{ zIndex: 999 }} />
          </ReactMapGL>
          <FadeTransition in={max_val > 0} mountOnEnter>
            <div className="p-3 pb-2 bg-white shadow rounded absolute right-2 bottom-2 w-60 z-10">
              <ColourBar
                dmin={min_val}
                dmax={max_val}
                scale={colorScale}
                type={color_scale_type}
              />
            </div>
          </FadeTransition>
        </div>
      )}
    </Measure>
  )
}

export default Chloropleth
