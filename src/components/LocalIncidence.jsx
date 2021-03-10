import React, { useState, useMemo } from 'react'
import { Checkbox } from 'semantic-ui-react'
import Measure from 'react-measure'

import MultiLinePlot from './MultiLinePlot'
import classnames from 'classnames'

const GraphHeading =
  ({ children, className }) =>
    <h3 className={classnames(className, 'font-bold text-gray-600')}>{children}</h3>

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
        <div ref={measureRef}>
          <h2>Local incidences</h2>
          <p className='lead'>Local Authority: {name} <small className='ltla_small_text'>{lad}</small></p>
          <GraphHeading>Incidence</GraphHeading>
          <MultiLinePlot
            width={width}
            lad_data={lad_data}
            date={date}
            parameter='lambda'
          />
          <GraphHeading className='flex justify-between'>
            Proportion
            <Checkbox
              checked={proportion_display_type === 'area'}
              label='Area'
              onChange={handleChange}
              style={{ display: 'inline-block' }}
              toggle
            />
          </GraphHeading>
          <MultiLinePlot
            width={width}
            lad_data={lad_data}
            date={date}
            parameter='p'
            type={proportion_display_type}
          />
          <GraphHeading>R</GraphHeading>
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
