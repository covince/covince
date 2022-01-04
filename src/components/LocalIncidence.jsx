import React, { useState, useMemo } from 'react'
import Measure from 'react-measure'
import classNames from 'classnames'

import { useInjection } from '../components'

function LocalIncidence (props) {
  const {
    activeLineages,
    areaName,
    chartDefinitions,
    chartZoom,
    className,
    date,
    darkMode,
    isMobile = false,
    lineColor,
    setDate,
    values,
    zoomEnabled
  } = props

  const [{ Chart }, injectProps = {}] = useInjection()

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
          {width
            ? chartDefinitions.map(chart =>
              <Chart
                key={chart.parameter}
                activeLineages={activeLineages}
                allowStack={chart.allow_stack}
                area_data={area_data}
                areaName={areaName}
                chartZoom={chartZoom}
                darkMode={darkMode}
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
                {...injectProps.Chart}
              />
            )
            : <p className='text-xs uppercase tracking-wider text-subheading text-center mt-6'>loading charts</p>}
        </div>
      )}
    </Measure>
  )
}

export default LocalIncidence
