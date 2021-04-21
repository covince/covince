
import React, { useState, useMemo, useCallback } from 'react'
import Measure from 'react-measure'
import MultiLinePlot from './MultiLinePlot'
import { Heading } from './Typography'

const ChartHeading = ({ isMobile, ...props }) =>
  isMobile
    ? <h2 {...props} className={classNames(props.className, 'font-bold text-heading')} />
    : <Heading {...props} />

const Chart = ({ heading, controls, isMobile, ...props }) => {
  const [height, setHeight] = useState(0)
  const chart = (
      <>
        <ChartHeading className='pl-12 pr-6 flex items-baseline justify-between' isMobile={isMobile}>
          {heading}
          {controls}
        </ChartHeading>
        <MultiLinePlot
          height={isMobile ? props.width * (1 / 2) : Math.max(height - 24, props.width * (1 / 3), 168)}
          {...props}
          className='-mt-1 md:m-0'
        />
      </>
  )

  if (isMobile) {
    return <div>{chart}</div>
  }

  return (
      <Measure
        bounds
        onResize={rect => {
          // setting width here does not work when reducing screen size
          setHeight(rect.bounds.height)
        }}
      >
        {({ measureRef }) => (
          <div ref={measureRef}>
            {chart}
          </div>
        )}
      </Measure>
  )
}

export default Chart
