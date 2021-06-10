import 'maplibre-gl/dist/maplibre-gl.css'
import './Chloropleth.css'

import React, { useState, useMemo, useEffect } from 'react'
import classnames from 'classnames'
import * as tailwindColors from 'tailwindcss/colors'
import ReactMapGL, { NavigationControl } from 'react-map-gl'
import Measure from 'react-measure'
import { interpolateMagma } from 'd3-scale-chromatic'

import FadeTransition from './FadeTransition'
import MapPopup from './MapPopup'

import useQueryAsState from '../hooks/useQueryAsState'
import Checkbox from './Checkbox'

// original RGBs left in for reference
const colourStops = [
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
  const index = (x.index - 0.13) / (1 - 0.13)
  return { index, rgb: interpolateMagma(x.index) }
}).slice(0) // Cut off the first bit of magma with black

const makeMagmaGradient = (transform) => {
  const stops = []
  for (let i = 0; i <= 100; i += 1) {
    const value = transform(i / 100)
    const color = interpolateMagma(value)
    stops.push(`${color} ${i}%`)
  }
  return `linear-gradient(to right, ${stops.join(',')})`
}

const RColourStops = [
  { index: 0.125, rgb: 'rgb(255, 0, 0)' },
  { index: 0.75, rgb: 'rgb(255, 255, 255)' },
  { index: 1, rgb: 'rgb(0, 0, 255)' }
]

const gradients = {
  linear: makeMagmaGradient(v => 1.13 - (v + 0.13) / 1.13),
  quadratic: makeMagmaGradient(v => 1.13 - (Math.sqrt(v) + 0.13) / 1.13),
  R_scale: `linear-gradient(to left, ${RColourStops.map(_ => `${_.rgb} ${_.index * 100}%`).join(',')})`
}

const ColourBar = ({ dmin, dmax, type, className, percentage }) => {
  let midpoint
  if (dmax > 2) {
    midpoint = Math.ceil((dmin + dmax) * 0.5)
  } else {
    midpoint = Math.round(10 * (dmin + dmax) * 0.5) / 10
  }

  const gradient = gradients[type]

  const formatValue = useMemo(() =>
    percentage
      ? v => `${Number.isInteger(v) ? v : v.toFixed(1)}%`
      : (v, method = 'round') => Math[method](v).toLocaleString()
  , [percentage])

  return (
    <>
      <div className='h-3 rounded-sm' style={{ backgroundImage: gradient }} />
      <div className='grid grid-cols-3 text-xs tracking-wide leading-6'>
        <span>
          {formatValue(dmin, 'floor')}
        </span>
        <span className='text-center'>
          {formatValue(midpoint)}
        </span>
        <span className='text-right'>
          {formatValue(dmax, 'ceil')}
        </span>
      </div>
    </>
  )
}

function clampViewport (viewport, bounds) {
  if (viewport.longitude < bounds.min_longitude) {
    viewport.longitude = bounds.min_longitude
  } else if (viewport.longitude > bounds.max_longitude) {
    viewport.longitude = bounds.max_longitude
  }
  if (viewport.latitude < bounds.min_latitude) {
    viewport.latitude = bounds.min_latitude
  } else if (viewport.latitude > bounds.max_latitude) {
    viewport.latitude = bounds.max_latitude
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
  const { geojson, values, selected_area, config = {} } = props

  const [query, updateQuery] = useQueryAsState(
    mapViewportToQuery({
      latitude: config.default_lat,
      longitude: config.default_lon,
      zoom: props.isMobile ? config.default_zoom_mob : config.default_zoom,
      pitch: 0,
      bearing: 0
    })
  )

  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    ...mapQueryToViewport(query, config.bounds)
  })

  useEffect(() => {
    setViewport({ ...viewport, ...mapQueryToViewport(query, config.bounds) })
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
    clampViewport(newViewport, config.bounds)
    setViewport(newViewport)
  }

  const features = useMemo(() => {
    const features = {
      selected: [],
      active: [],
      nulls: [],
      others: []
    }

    if (values === null) {
      return features
    }

    for (const feature of geojson.features) {
      const { area_id } = feature.properties
      const areaValues = values[area_id] || {}
      if (areaValues.mean === null) {
        features.nulls.push(feature)
        if (area_id === selected_area) features.selected.push(feature)
      } else if (areaValues.mean !== undefined) {
        const { mean, lower, upper } = areaValues
        const _feature = {
          ...feature,
          properties: {
            ...feature.properties,
            value: mean,
            alpha: lower !== null && upper !== null ? lower / upper : 1
          }
        }
        features.active.push(_feature)
        if (area_id === selected_area) features.selected.push(feature)
      } else {
        features.others.push(feature)
      }
    }
    return features
  }, [geojson, values, selected_area])

  const { color_scale_type, min_val, max_val } = props

  const colorScale = useMemo(() => {
    if (max_val === 0) {
      return [0, '#fff']
    }

    const stops = color_scale_type === 'R_scale' ? RColourStops : colourStops

    const scale = []
    const range = color_scale_type === 'quadratic'
      ? Math.sqrt(max_val) - Math.sqrt(min_val)
      : max_val - min_val

    for (const { index, rgb } of stops) {
      scale.unshift(rgb)
      scale.unshift(range * (1 - index))
    }

    return scale
  }, [max_val, min_val, color_scale_type])

  const [showConfidence, setShowConfidence] = useState(true)

  const { lineColor = 'blueGray' } = props

  const mapStyle = useMemo(() => ({
    version: 8,
    sources: {
      selectedAreas: {
        type: 'geojson',
        data: {
          ...geojson,
          features: features.selected
        }
      },
      activeAreas: {
        type: 'geojson',
        data: {
          ...geojson,
          features: features.active
        }
      },
      nullAreas: {
        type: 'geojson',
        data: {
          ...geojson,
          features: features.nulls
        }
      },
      otherAreas: {
        type: 'geojson',
        data: {
          ...geojson,
          features: features.others
        }
      }
    },
    layers: [
      {
        id: 'other-areas-fill',
        type: 'fill',
        source: 'otherAreas',
        paint: {
          'fill-color': '#fff'
        }
      },
      {
        id: 'other-areas-line',
        type: 'line',
        source: 'otherAreas',
        paint: {
          'line-color': tailwindColors[lineColor][300],
          'line-width': 0.5
        }
      },
      {
        id: 'null-areas-fill',
        type: 'fill',
        source: 'nullAreas',
        paint: {
          'fill-color': '#fff'
        }
      },
      {
        id: 'null-areas-line',
        type: 'line',
        source: 'nullAreas',
        paint: {
          'line-color': tailwindColors[lineColor][500],
          'line-width': 0.5
        }
      },
      {
        id: 'active-areas-fill',
        type: 'fill',
        source: 'activeAreas',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            color_scale_type === 'quadratic'
              ? ['sqrt', ['get', 'value']]
              : ['get', 'value'],
            ...colorScale
          ],
          'fill-opacity': showConfidence ? ['get', 'alpha'] : 1
        }
      },
      {
        id: 'active-areas-line',
        type: 'line',
        source: 'activeAreas',
        paint: {
          'line-color': tailwindColors[lineColor][600],
          'line-width': 0.5
        }
      },
      {
        id: 'selected-areas-line',
        type: 'line',
        source: 'selectedAreas',
        paint: {
          'line-color': tailwindColors[lineColor][900],
          'line-width': 2
        }
      }
    ]
  }), [features, colorScale, color_scale_type, showConfidence])

  const [hoveredFeature, setHoveredFeature] = useState(null)

  const { percentage, handleOnClick } = props

  const hoverPopup = useMemo(() => {
    if (hoveredFeature === null) return null
    const { area_id, area_name, lat, long } = hoveredFeature.properties
    const value = values[area_id]
    if (area_id in values) {
      return { lat, long, value, label: area_name, onClick: () => handleOnClick(area_id) }
    }
  }, [hoveredFeature, values, handleOnClick])

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
            minZoom={config.min_zoom}
            disableTokenWarning
            onViewportChange={onViewportChange}
            mapStyle={mapStyle}
            mapboxApiUrl={null}
            className='bg-gray-50'
            interactiveLayerIds={['null-areas-fill', 'active-areas-fill']}
            onNativeClick={e => { // faster for some reason
              const [feature] = e.features
              if (!feature) {
                handleOnClick('overview')
              } else {
                handleOnClick(feature.properties.area_id)
              }
            }}
            onHover={e => {
              const [feature] = e.features
              if (feature && feature.properties.value !== 'null') {
                if (feature.properties.lat === undefined) {
                  // Hack where if no central point is specified
                  // we use mouse position for popup
                  feature.properties.lat = e.lngLat[1]
                  feature.properties.long = e.lngLat[0]
                }
                setHoveredFeature(feature)
              } else {
                setHoveredFeature(null)
              }
            }}
            getCursor={({ isHovering, isDragging }) => {
              if (isDragging) return 'grabbing'
              if (isHovering || selected_area !== 'overview') return 'pointer'
              return 'grab'
            }}
          >
            <NavigationControl className='right-2 top-2 z-10' />
            { hoverPopup && <MapPopup {...hoverPopup} percentage={percentage} /> }
          </ReactMapGL>
          <FadeTransition in={max_val > 0} mountOnEnter>
            <div className='absolute left-0 bottom-0 w-60 z-10 p-2 pb-0 bg-white bg-opacity-80'>
              <form className='mb-1.5 ml-2'>
                <Checkbox
                  id='map_confidence_intervals'
                  className='text-primary'
                  checked={showConfidence}
                  onChange={e => console.log(e.target.value) || setShowConfidence(e.target.checked)}
                >
                  <span className='text-xs tracking-wide select-none'>Confidence intervals</span>
                </Checkbox>
              </form>
              <ColourBar
                dmin={min_val}
                dmax={max_val}
                type={color_scale_type}
                percentage={percentage}
              />
            </div>
          </FadeTransition>
        </div>
      )}
    </Measure>
  )
}

export default Chloropleth
