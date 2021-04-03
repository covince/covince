import React, { useState, useMemo } from 'react'
import Measure from 'react-measure'
import classNames from 'classnames'

import MultiLinePlot from './MultiLinePlot'
import Checkbox from './Checkbox'
import { Heading } from './Typography'

const ChartHeading = ({ isMobile, ...props }) =>
  isMobile
    ? <h2 {...props} className={classNames(props.className, 'font-bold text-heading')} />
    : <Heading {...props} />

const IncidenceChart = ({ heading, controls, isMobile, ...props }) => {
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

function LocalIncidence ({ values, date, setDate, className, isMobile = false, lineColor }) {
  const lad_data = useMemo(() => values || [], [values])

  const [proportion_display_type, setProportionDisplayType] = useState('area')
  const [lambda_display_type, setLambdaDisplayType] = useState('line')

  const handlePropChange = function (event) {
    const target = event.target
    if (target.checked) {
      setProportionDisplayType('area')
    } else {
      setProportionDisplayType('line')
    }
  }
  const handleLambdaChange = function (event) {
    const target = event.target
    if (target.checked) {
      setLambdaDisplayType('area')
    } else {
      setLambdaDisplayType('line')
    }
  }

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
          <IncidenceChart
            width={width}
            isMobile={isMobile}
            heading='Incidence'
            controls={
              <Checkbox
                id='lambda_display_type'
                checked={lambda_display_type === 'area'}
                label='Stack'
                onChange={handleLambdaChange}
                toggle
              />
            }
            lad_data={lad_data}
            date={date}
            setDate={setDate}
            parameter='lambda'
            type={lambda_display_type}
            stroke={lineColor}
          />
          <IncidenceChart
            width={width}
            isMobile={isMobile}
            heading='Proportion'
            controls={
              <Checkbox
                id='proportion_display_type'
                checked={proportion_display_type === 'area'}
                label='Stack'
                onChange={handlePropChange}
                toggle
              />
            }
            lad_data={lad_data}
            date={date}
            setDate={setDate}
            parameter='p'
            type={proportion_display_type}
            stroke={lineColor}
          />
          <IncidenceChart
            width={width}
            isMobile={isMobile}
            heading='R'
            lad_data={lad_data}
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
