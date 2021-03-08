import React, { useState } from 'react'
import { Checkbox } from 'semantic-ui-react'
import memoize from 'memoize-one'
import Measure from 'react-measure'

import MultiLinePlot from './MultiLinePlot'

function get_lad_data (dataframe, lad, lineage) {
  // const lad_data = dataframe.where((item) => item.location === lad ).where((item) => item.parameter === "lambda" ).where((item) => item.lineage === lineage ).toArray()
  const lad_data = dataframe ? dataframe.where((item) => item.location === lad).toArray() : []
  return (lad_data)
}

const memoized_get_lad_data = memoize(get_lad_data)

function LocalIncidence ({ dataframe, lad, date, name, lineage }) {
  const lad_data = memoized_get_lad_data(dataframe, lad, lineage)

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
          <div className='graph_header'>Incidence</div>
          <MultiLinePlot width={width} lad_data={lad_data} date={date} parameter='lambda' />
          <hr className='graphdivider' />
          <div className='graph_header'>Proportion
            <div className='right_align'>
              <Checkbox
                checked={proportion_display_type === 'area'}
                label='Area'
                onChange={handleChange}
                style={{ display: 'inline-block' }}
                toggle
              />
            </div>
          </div>
          {proportion_display_type === 'line' && <MultiLinePlot width={width} lad_data={lad_data} date={date} parameter='p' />}
          {proportion_display_type === 'area' && <MultiLinePlot width={width} lad_data={lad_data} date={date} parameter='p' type='area' />}
          <hr className='graphdivider' />
          <div className='graph_header'>R</div>
          <MultiLinePlot width={width} lad_data={lad_data} date={date} parameter='R' />
        </div>
      )}
    </Measure>
  )
}

export default LocalIncidence
