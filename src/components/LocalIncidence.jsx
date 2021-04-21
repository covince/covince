import React, { useState, useMemo, useCallback } from 'react'
import Measure from 'react-measure'
import classNames from 'classnames'

import Chart from './Chart'
import Checkbox from './Checkbox'

import useQueryAsState from '../hooks/useQueryAsState'

function LocalIncidence ({ values, date, setDate, className, isMobile = false, lineColor, colors }) {
  const area_data = useMemo(() => values || [], [values])

  const [{ proportion = 'area', incidence = 'line' }, updateQuery] = useQueryAsState()

  const handlePropChange = useCallback(function (event) {
    updateQuery({ proportion: event.target.checked ? undefined : 'line' })
  }, [updateQuery])

  const handleLambdaChange = useCallback(function (event) {
    updateQuery({ incidence: event.target.checked ? 'area' : undefined })
  }, [updateQuery])

  const [width, setWidth] = useState(0)

  return (
    <Measure
      bounds
      onResize={rect => {
        if (rect.bounds.width > 0) {
          setWidth(rect.bounds.width)
        }
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} className={classNames('grid grid-rows-3 gap-2', className)}>
          <Chart
            colors = {colors}
            width={width}
            isMobile={isMobile}
            heading='Incidence'
            controls={
              <Checkbox
                id='lambda_display_type'
                checked={incidence === 'area'}
                label='Stack'
                onChange={handleLambdaChange}
                toggle
              />
            }
            area_data={area_data}
            date={date}
            setDate={setDate}
            parameter='lambda'
            type={incidence}
            stroke={lineColor}
          />
          <Chart
            colors= {colors}
            width={width}
            isMobile={isMobile}
            heading='Proportion'
            controls={
              <Checkbox
                id='proportion_display_type'
                checked={proportion === 'area'}
                label='Stack'
                onChange={handlePropChange}
                toggle
              />
            }
            area_data={area_data}
            date={date}
            setDate={setDate}
            parameter='p'
            type={proportion}
            stroke={lineColor}
          />
          <Chart
          colors = {colors}
            width={width}
            isMobile={isMobile}
            heading='R'
            area_data={area_data}
            date={date}
            setDate={setDate}
            parameter='R'
            stroke={lineColor}
          />
        </div>
      )}
    </Measure>
  )
}

export default LocalIncidence
