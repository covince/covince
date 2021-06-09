import React from 'react'
import { Popup } from 'react-map-gl'

const MapPopup = ({ value, percentage, lat, long, onClick, label }) => {
  const formatValue = React.useMemo(() =>
    percentage
      ? v => `${Number.isInteger(v) ? v : v.toFixed(1)}%`
      : v => `${Number.isInteger(v) ? v : v.toFixed(2)}`
  , [percentage])
  return (
    <Popup
      closeButton={false}
      captureDrag={false}
      latitude={lat}
      longitude={long}
      className='text-center text-current leading-none font-sans'
      tipSize={8}
    >
      <div className='p-2' onClick={onClick}>
        { value !== null &&
          <p className='font-bold text-gray-700'>
            {formatValue(value.mean)}
          </p> }
        <p className='text-sm'>
          {label}
        </p>
      { value && value.upper !== null && value.lower !== null &&
        <p className='text-xs tracking-wide text-gray-700 _font-bold'>
          {formatValue(value.lower)} - {formatValue(value.upper)}
        </p> }
      </div>
    </Popup>
  )
}

export default MapPopup
