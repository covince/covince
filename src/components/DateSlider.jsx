import React from 'react'
import Slider from 'rc-slider'

function DateSlider (props) {
  const unique_dates = props.unique_dates
  const date = props.date
  return (
    <Slider
      min={0}
      max={unique_dates && unique_dates.length - 1}

      value={unique_dates.indexOf(date)}
    />
  )
}

export default DateSlider
