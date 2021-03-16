import React, { useState, useMemo } from 'react'
import Measure from 'react-measure'
import classNames from 'classnames'

import MultiLinePlot from './MultiLinePlot'
import Checkbox from './Checkbox'
import { Heading } from './Typography'

const IncidenceChart = ({ heading, isMobile, ...props }) => {
  const [height, setHeight] = useState(0)
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
          {heading}
          <MultiLinePlot
            height={isMobile ? props.width * (1 / 2) : height - 24}
            {...props}
            className='-mt-2 md:m-0'
          />
        </div>
      )}
    </Measure>
  )
}

const ChartHeading = ({ isMobile, ...props }) =>
  isMobile
    ? <h2 {...props} className={classNames(props.className, 'font-bold text-gray-700')} />
    : <Heading {...props} />

function LocalIncidence ({ dataframe, date, setDate, className, isMobile = false }) {
  const lad_data = useMemo(() => dataframe ? dataframe.toArray() : [], [dataframe])

  const [proportion_display_type, setProportionDisplayType] = useState('area')

  const handleChange = function (event) {
    const target = event.target
    if (target.checked) {
      setProportionDisplayType('area')
    } else {
      setProportionDisplayType('line')
    }
  }

  const [width, setWidth] = useState(0)

  return (
    <Measure
      bounds
      onResize={rect => {
        setWidth(rect.bounds.width)
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} className={classNames('grid grid-rows-3 h-full -ml-3 md:mx-0 md:grid', className)}>
          <IncidenceChart
            width={width}
            isMobile={isMobile}
            heading={<ChartHeading className='pl-12' isMobile={isMobile}>Incidence</ChartHeading>}
            lad_data={lad_data}
            date={date}
            setDate={setDate}
            parameter='lambda'
          />
          <IncidenceChart
            width={width}
            isMobile={isMobile}
            heading={
              <ChartHeading className='pl-12 pr-6 flex items-baseline justify-between' isMobile={isMobile}>
                Proportion
                <Checkbox
                  id='proportion_display_type'
                  checked={proportion_display_type === 'area'}
                  label='Area'
                  onChange={handleChange}
                  toggle
                />
              </ChartHeading>
            }
            lad_data={lad_data}
            date={date}
            setDate={setDate}
            parameter='p'
            type={proportion_display_type}
          />
          <IncidenceChart
            width={width}
            isMobile={isMobile}
            heading={<ChartHeading className='pl-12' isMobile={isMobile}>R</ChartHeading>}
            lad_data={lad_data}
            date={date}
            setDate={setDate}
            parameter='R'
          />
        </div>
      )}
    </Measure>
  )
}

export default LocalIncidence
