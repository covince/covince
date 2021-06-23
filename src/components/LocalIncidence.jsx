import React, { useState, useMemo } from 'react'
import Measure from 'react-measure'
import classNames from 'classnames'

import Chart from './Chart'

function LocalIncidence (props) {
  const {
    activeLineages,
    chartDefinitions,
    className,
    date,
    isMobile = false,
    lineColor,
    setDate,
    values,
    zoomEnabled
  } = props

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
              allowStack={chart.allow_stack}
              area_data={area_data}
              date={date}
              defaultType={chart.default_type}
              format={chart.format}
              heading={chart.heading}
              isMobile={isMobile}
              numCharts={chartDefinitions.length}
              parameter={chart.parameter}
              setDate={setDate}
              stroke={lineColor}
              tooltipEnabled={isMobile ? !zoomEnabled : true}
              width={width}
              xAxis={chart.x_axis}
              yAxis={chart.y_axis}
              zoomEnabled={zoomEnabled}
            />
          )}
        </div>
      )}
    </Measure>
  )
}

export default LocalIncidence
