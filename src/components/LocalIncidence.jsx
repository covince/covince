import React, { useState, useMemo, useCallback } from 'react'
import Measure from 'react-measure'
import classNames from 'classnames'

import Chart from './Chart'

function LocalIncidence ({ chartDefinitions, values, date, setDate, className, isMobile = false, lineColor, colors }) {
  const area_data = useMemo(() => values || [], [values])
  const numCharts = chartDefinitions.length

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
        <div ref={measureRef} className={classNames(`grid gap-2`, className)}>
          {
            chartDefinitions.map(chart => <Chart
              colors = {colors}
              width={width}
              isMobile={isMobile}
              heading={chart.heading}
              area_data={area_data}
              date={date}
              setDate={setDate}
              parameter={chart.parameter}
              key={chart.parameter}
              defaultType={chart.defaultType}
              stroke={lineColor}
              allowStack={chart.allowStack}
              numCharts ={numCharts}
            />)
          }

        </div>
      )}
    </Measure>
  )
}

export default LocalIncidence
