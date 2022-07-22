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

  const _onMinChange = React.useCallback((e) => {
    onMinChange(Math.min(e.target.value, maxValue))
  }, [maxValue, onMinChange])

  const _onMaxChange = React.useCallback((e) => {
    onMaxChange(Math.max(e.target.value, minValue))
  }, [minValue, onMaxChange])

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
        onChange={_onMinChange}
      />
      <Slider
        min={min}
        max={max}
        value={maxValue}
        onChange={_onMaxChange}
      />
    </div>
  )
}

export default MinMaxSlider
