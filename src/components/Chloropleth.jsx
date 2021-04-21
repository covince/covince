import 'maplibre-gl/dist/maplibre-gl.css'
import './Chloropleth.css'

import React, { useState, useMemo, useEffect } from 'react'
import classnames from 'classnames'
import * as tailwindColors from 'tailwindcss/colors'
import ReactMapGL, { NavigationControl, Popup } from 'react-map-gl'
import Measure from 'react-measure'

import FadeTransition from './FadeTransition'
import useQueryAsState from '../hooks/useQueryAsState'

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
].map(x => {
  x.index = (x.index - 0.13) / (1 - 0.13)
  return x
}).slice(1) // Cut off the first bit of magma with black

const quadColorStops =
  colorStops.map(_ => ({ rgb: _.rgb, index: Math.sqrt(_.index) }))

const ColourBar = ({ dmin, dmax, scale, type, className, percentage }) => {
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

  const formatValue = useMemo(() =>
    percentage
      ? v => `${v}%`
      : v => Math.round(v).toLocaleString()
  , [percentage])

  return (
    <div className={classnames('p-2 pb-0 bg-white bg-opacity-80', className)}>
      <div className='h-3 rounded-sm' style={{ backgroundImage: gradient }} />
      <div className='grid grid-cols-3 text-xs leading-6'>
        <span>
          {formatValue(dmin)}
        </span>
        <span className='text-center'>
          {formatValue(midpoint)}
        </span>
        <span className='text-right'>
          {formatValue(dmax)}
        </span>
      </div>
    </div>
  )
}

function clampViewport (viewport, bounds) {
  if (viewport.longitude < bounds.minLongitude) {
    viewport.longitude = bounds.minLongitude
  } else if (viewport.longitude > bounds.maxLongitude) {
    viewport.longitude = bounds.maxLongitude
  }
  if (viewport.latitude < bounds.minLatitude) {
    viewport.latitude = bounds.minLatitude
  } else if (viewport.latitude > bounds.maxLatitude) {
    viewport.latitude = bounds.maxLatitude
  }
}

const mapQueryToViewport = ({ latitude, longitude, zoom, pitch = '0', bearing = '0' }, bounds) => {
  const viewport = {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    zoom: parseFloat(zoom),
    pitch: parseFloat(pitch),
    bearing: parseFloat(bearing)
  }
  clampViewport(viewport, bounds)
  return viewport
}

const mapViewportToQuery = ({ latitude, longitude, zoom, pitch, bearing }) => ({
  latitude: latitude.toFixed(6),
  longitude: longitude.toFixed(6),
  zoom: zoom.toFixed(2),
  pitch: pitch !== 0 ? pitch.toFixed(6) : undefined,
  bearing: bearing !== 0 ? bearing.toFixed(6) : undefined
})

const getDependencyArray = obj =>
  [obj.latitude, obj.longitude, obj.zoom, obj.pitch, obj.bearing]

const doesNotMatch = (a, b) => (
  a.latitude !== b.latitude ||
  a.longitude !== b.longitude ||
  a.zoom !== b.zoom ||
  a.pitch !== b.pitch ||
  a.bearing !== b.bearing
)

const Chloropleth = (props) => {
  const { tiles, date, index, selected_area } = props

  const [query, updateQuery] = useQueryAsState(
    mapViewportToQuery({
      latitude: tiles.config.default_lat,
      longitude: tiles.config.default_lon,
      zoom: props.isMobile ? tiles.config.default_zoom_mob : tiles.config.default_zoom,
      pitch: 0,
      bearing: 0
    })
  )

  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    ...mapQueryToViewport(query, tiles.config.bounds)
  })

  useEffect(() => {
    setViewport({ ...viewport, ...mapQueryToViewport(query, tiles.config.bounds) })
  }, getDependencyArray(query))

  useEffect(() => {
    const timeout = setTimeout(() => {
      const update = mapViewportToQuery(viewport)
      if (doesNotMatch(update, query)) {
        updateQuery(update, 'replace')
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, getDependencyArray(viewport))

  const onViewportChange = newViewport => {
    clampViewport(newViewport, tiles.config.bounds)
    setViewport(newViewport)
  }

  const data = useMemo(() => {
    if (tiles === null) {
      return null
    }

    if (index === null) {
      return tiles
    }

    const features = tiles.features.map(f => {
      const { area_id } = f.properties

      const values = index ? index[area_id] : null
      const value = values ? values[date] : undefined
      return {
        ...f,
        properties: {
          ...f.properties,
          value,
          selected: area_id === selected_area
        }
      }
    })

    return {
      ...tiles,
      features
    }
  }, [tiles, date, index, selected_area])

  const { color_scale_type, min_val, max_val } = props

  const colorScale = useMemo(() => {
    if (max_val === 0) {
      return [0, '#fff']
    }

    if (color_scale_type === 'R_scale') {
      return [0, '#0000FF', 1, '#FFFFFF', 3.5, '#FF0000']
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
      areas: {
        type: 'geojson',
        data
      }
    },
    layers: [
      {
        id: 'areas-fill',
        type: 'fill',
        source: 'areas',
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
        id: 'areas-line',
        type: 'line',
        source: 'areas',
        paint: {
          'line-color': ['case', ['==', ['get', 'value'], null],
            tailwindColors[lineColor][300], [
              'case',
              ['get', 'selected'],
              tailwindColors[lineColor][900],
              tailwindColors[lineColor][600]
            ]],
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

  const [popupFeature, setPopupFeature] = useState(null)

  const { percentage } = props

  const formatValue = useMemo(() =>
    percentage
      ? v => `${v.toFixed(1)}%`
      : v => v.toFixed(2)
  , [percentage])

  return (
    <Measure
      bounds
      onResize={rect => {
        setViewport({
          ...viewport,
          width: rect.bounds.width || viewport.width,
          height: rect.bounds.height || viewport.height
        })
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} className={classnames(props.className, 'relative z-0')}>
          <ReactMapGL
            {...viewport}
            minZoom={tiles.config.min_zoom}
            disableTokenWarning
            onViewportChange={onViewportChange}
            mapStyle={mapStyle}
            mapboxApiUrl={null}
            className='bg-gray-50'
            interactiveLayerIds={['areas-fill']}
            onNativeClick={e => { // faster for some reason
              const [feature] = e.features
              if (!feature) {
                props.handleOnClick('overview')
              } else if ('value' in feature.properties) {
                props.handleOnClick(feature.properties.area_id)
              }
            }}
            onHover={e => {
              const [feature] = e.features
              if (feature && 'value' in feature.properties) {
                if (feature.properties.latitude === undefined) {
                  // Hack where if no central point is specified
                  // we use mouse position for popup
                  feature.properties.lat = e.lngLat[1]
                  feature.properties.long = e.lngLat[0]
                }
                setPopupFeature(feature.properties)
              } else {
                setPopupFeature(null)
              }
            }}
            getCursor={({ isHovering, isDragging }) => {
              if (isDragging) return 'grabbing'
              if (isHovering || selected_area !== 'overview') return 'pointer'
              return 'grab'
            }}
          >
            <NavigationControl className='right-2 top-2 z-10' />
            {popupFeature &&
              <Popup
                closeButton={false}
                captureDrag={false}
                latitude={popupFeature.lat}
                longitude={popupFeature.long}
                className='text-center text-current leading-none font-sans'
                tipSize={8}
              >
                <div className='p-2' onClick={() => props.handleOnClick(popupFeature.area_id)}>
                  <p className='font-bold text-gray-700'>
                    {formatValue(popupFeature.value)}
                  </p>
                  <p className='text-sm'>
                    {popupFeature.area_name}
                  </p>
                </div>
              </Popup>}
          </ReactMapGL>
          <FadeTransition in={max_val > 0} mountOnEnter>
            <ColourBar
              className='absolute left-0 bottom-0 w-60 z-10'
              dmin={min_val}
              dmax={max_val}
              scale={colorScale}
              type={color_scale_type}
              percentage={percentage}
            />
          </FadeTransition>
        </div>
      )}
    </Measure>
  )
}

export default Chloropleth
