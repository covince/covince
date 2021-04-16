import React, { useState, useMemo, useCallback } from 'react'
import Measure from 'react-measure'
import classNames from 'classnames'

import MultiLinePlot from './MultiLinePlot'
import Checkbox from './Checkbox'
import { Heading } from './Typography'

import useQueryAsState from '../hooks/useQueryAsState'

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
        height={isMobile ? props.width * (1 / 2) : Math.max(height - 24, props.width * (1 / 2), 168)}
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

function LocalIncidence ({ values, date, setDate, className, isMobile = false, lineColor, activeLineages, colors }) {
  const lad_data = useMemo(() => values || [], [values])

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
        <div ref={measureRef} className={classNames('grid grid-rows-2 gap-2', className)}>
          <Chart
            colors = {colors}
            width={width}
            isMobile={isMobile}
            heading='Genomes'
            controls={
              <Checkbox
                id='lambda_display_type'
                checked={incidence === 'area'}
                className='text-primary'
                label='Stack'
                onChange={handleLambdaChange}
              />
            }
            lad_data={lad_data}
            date={date}
            setDate={setDate}
            parameter='lambda'
            type={incidence}
            stroke={lineColor}
            activeLineages={activeLineages}
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
                className='text-primary'
                label='Stack'
                onChange={handlePropChange}
              />
            }
            lad_data={lad_data}
            date={date}
            setDate={setDate}
            parameter='p'
            type={proportion}
            stroke={lineColor}
            activeLineages={activeLineages}
          />

        </div>
      )}
    </Measure>
  )
}

export default LocalIncidence
