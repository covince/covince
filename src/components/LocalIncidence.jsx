import React, { useState, useMemo } from 'react'
import Measure from 'react-measure'

import MultiLinePlot from './MultiLinePlot'
import Checkbox from './Checkbox'
import { Heading } from './Typography'

const IncidenceChart = ({ heading, ...props }) => {
  const [height, setHeight] = useState(0)
  return (
    <Measure
      bounds
      onResize={rect => {
        console.log(rect)
        // setting width here does not work when reducing screen size
        setHeight(rect.bounds.height)
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef}>
          {heading}
          <MultiLinePlot
            height={height - 24}
            {...props}
          />
        </div>
      )}
    </Measure>
  )
}

function LocalIncidence ({ dataframe, lad, date, setDate, name }) {
  const lad_data = useMemo(() => {
    return dataframe ? dataframe.where((item) => item.location === lad).toArray() : []
  }, [dataframe, lad])

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
        <div ref={measureRef} className='grid grid-rows-3 gap-3'>
          <IncidenceChart
            width={width}
            heading={<Heading className='pl-12'>Incidence</Heading>}
            lad_data={lad_data}
            date={date}
            setDate={setDate}
            parameter='lambda'
          />
          <IncidenceChart
            width={width}
            heading={
              <Heading className='pl-12 pr-6 flex items-baseline justify-between'>
                Proportion
                <Checkbox
                  id='proportion_display_type'
                  checked={proportion_display_type === 'area'}
                  label='Area'
                  onChange={handleChange}
                  toggle
                />
              </Heading>
            }
            lad_data={lad_data}
            date={date}
            setDate={setDate}
            parameter='p'
            type={proportion_display_type}
          />
          <IncidenceChart
            width={width}
            heading={<Heading className='pl-12'>R</Heading>}
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
