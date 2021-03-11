import React, { useState, useMemo } from 'react'
import Measure from 'react-measure'

import MultiLinePlot from './MultiLinePlot'
import Checkbox from './Checkbox'

function LocalIncidence ({ dataframe, lad, date, name }) {
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
        <div ref={measureRef} className='space-y-2'>
          <h3 className='h2'>Incidence</h3>
          <MultiLinePlot
            width={width}
            lad_data={lad_data}
            date={date}
            parameter='lambda'
          />
          <h3 className='h2 flex justify-between'>
            Proportion
            <Checkbox
              id='proportion_display_type'
              checked={proportion_display_type === 'area'}
              label='Area'
              onChange={handleChange}
              toggle
            />
          </h3>
          <MultiLinePlot
            width={width}
            lad_data={lad_data}
            date={date}
            parameter='p'
            type={proportion_display_type}
          />
          <h3 className='h2'>R</h3>
          <MultiLinePlot
            width={width}
            lad_data={lad_data}
            date={date}
            parameter='R'
          />
        </div>
      )}
    </Measure>
  )
}

export default LocalIncidence
