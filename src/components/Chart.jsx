
import React, { useState, useCallback } from 'react'
import Measure from 'react-measure'
import MultiLinePlot from './MultiLinePlot'
import { Heading } from './Typography'
import classNames from 'classnames'
import Checkbox from './Checkbox'
import useQueryAsState from '../hooks/useQueryAsState'
const ChartHeading = ({ isMobile, ...props }) =>
  isMobile
    ? <h2 {...props} className={classNames(props.className, 'font-bold text-heading')} />
    : <Heading {...props} />

const Chart = ({ heading, defaultType, parameter, isMobile, allowStack, numCharts, ...props }) => {
  const line_type_accessor = `${parameter}_type`
  const [query, updateQuery] = useQueryAsState({ [line_type_accessor]: defaultType })

  const handleGraphTypeChange = useCallback(function (event) {
    updateQuery({ [line_type_accessor]: event.target.checked ? 'area' : 'line' })
  }, [updateQuery])

  const [height, setHeight] = useState(0)

  const chart = (
      <>
        <ChartHeading className='pl-12 pr-6 flex items-baseline justify-between' isMobile={isMobile}>
          {heading}
          {allowStack && <Checkbox
      id={line_type_accessor}
      checked={query[line_type_accessor] === 'area'}
      label='Stack'
      onChange={handleGraphTypeChange}
      toggle
    />}
        </ChartHeading>
        <MultiLinePlot
          height={isMobile ? props.width * (1 / 2) : Math.max(height - 24, props.width * (1 / numCharts), 168)}
          {...props}
          className='-mt-1 md:m-0'
          type={query[line_type_accessor]}
          parameter={parameter}
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
