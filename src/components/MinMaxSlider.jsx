import './MinMaxSlider.css'

import React from 'react'
import classNames from 'classnames'

import Slider from './Slider'

const MinMaxSlider = ({
  min,
  max,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  className,
  style,
  ...props
}) => {
  const _style = React.useMemo(() => ({
    ...style,
    '--min': min,
    '--max': max,
    '--min-v': minValue,
    '--max-v': maxValue
  }))
  return (
    <div
      className={classNames('covince-min-max', className)}
      style={_style}
      {...props}
    >
      <Slider
        min={min}
        max={max}
        value={minValue}
        onChange={onMinChange}
      />
      <Slider
        min={min}
        max={max}
        value={maxValue}
        onChange={onMaxChange}
      />
    </div>
  )
}

export default MinMaxSlider
