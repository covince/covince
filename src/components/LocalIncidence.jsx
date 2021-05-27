import React, { useState, useMemo } from 'react'
import Measure from 'react-measure'
import classNames from 'classnames'

import Chart from './Chart'

function LocalIncidence ({ chartDefinitions, values, date, setDate, className, isMobile = false, lineColor, activeLineages }) {
  const area_data = useMemo(() => values || [], [values])

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
        <div ref={measureRef} className={classNames('grid gap-2', className)}>
          {chartDefinitions.map(chart =>
            <Chart
              key={chart.parameter}
              activeLineages={activeLineages}
              width={width}
              isMobile={isMobile}
              heading={chart.heading}
              area_data={area_data}
              date={date}
              setDate={setDate}
              parameter={chart.parameter}
              defaultType={chart.default_type}
              stroke={lineColor}
              allowStack={chart.allow_stack}
              format={chart.format}
              yAxis={chart.y_axis}
              xAxis={chart.x_axis}
              numCharts={chartDefinitions.length}
            />
          )}
        </div>
      )}
    </Measure>
  )
}

export default LocalIncidence
