import './MultiLinePlot.css'

import React from 'react'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ComposedChart, Area } from 'recharts'
import _ from 'lodash'

const MultiLinePlot = ({ date, lad_data, parameter, type, width }) => {
  const data = lad_data
    .filter(x => x.parameter === parameter)
    .filter(x => x.lineage !== 'total')
  const grouped = _.groupBy(data, 'date') // creates an object where the key is the Time and the values are arrays of rows with that Time
  const for_lambda = [] // array to store the resulting data
  let lineages = new Set()
  for (const [key, value] of Object.entries(grouped)) { // loop over each group, key is the Time of the group, value is an array of rows for that Time
    const row = { date: key }
    for (const item of value) {
      row[item.lineage] = item.mean
      row[item.lineage + '_range'] = item.range
      lineages.add(item.lineage)
    }
    for_lambda.push(row)
  }

  lineages = Array.from(lineages)
  window.lineages = lineages
  const colors = ['red', 'green', 'blue', 'orange', 'pink', 'aqua', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload) {
      return (
        <div className='p-3 bg-white shadow rounded-md text-sm leading-5 z-10'>
          <h4 className='text-center text-gray-700 font-medium'>{label}</h4>
          <table>
            <thead className='sr-only'>

            </thead>
            <tbody>
            {payload.map(item => {
              if (item.name === '_range') {
                return null
              }
              return (
                <tr key={item.name} className='tooltip_entry'>
                  <td>
                    <i className='block rounded-full h-3 w-3' style={{ backgroundColor: item.stroke }} />
                  </td>
                  <td className='px-3'>
                    {item.name}
                  </td>
                  <td className='text-right'>
                    {item.value}
                  </td>
                </tr>
              )
            })}
            </tbody>
          </table>
        </div>
      )
    }

    return null
  }

  if (type === 'area') {
    return (
      <ComposedChart data={for_lambda} width={width} height={240}>
        <CartesianGrid stroke='#ccc' />

        {lineages.map((value, index) =>
          // eslint-disable-next-line react/jsx-key
          <Area
            // key={value}
            dataKey={value}
            fill={colors[index]}
            stroke={colors[index]}
            dot={false}
            isAnimationActive={false}
            stackId='1'
            name={value}
            type='monotone'
          />
        )}

        <XAxis dataKey='date' fontSize='14' tickFormatter={d => new Date(d).toLocaleDateString()} />
        <YAxis tickFormatter={value => parseFloat(value).toFixed(2)} domain={[0, 1]} fontSize='14' />
        <ReferenceLine x={date} stroke='#597fba' label='' strokeWidth={2} />

        <Tooltip content={CustomTooltip} />
      </ComposedChart>
    )
  } else {
    return (
      <ComposedChart data={for_lambda} width={width} height={240}>
        <CartesianGrid stroke='#ccc' />

        {lineages.map((value, index) =>
          // eslint-disable-next-line react/jsx-key
          <Area
            // key={value}
            isAnimationActive={false}
            type='monotone'
            name='_range'
            dataKey={value + '_range'}
            fill={colors[index]}
            strokeWidth={0}
          />
        )}
        {lineages.map((value, index) =>
          // eslint-disable-next-line react/jsx-key
          <Line
            // key={value}
            isAnimationActive={false}
            dot={false}
            name={value}
            type='monotone'
            dataKey={value}
            stroke={colors[index]}
          />
        )}

        <XAxis dataKey='date' fontSize='14' tickFormatter={d => new Date(d).toLocaleDateString()} />
        <YAxis fontSize='14' />
        <ReferenceLine x={date} stroke='#597fba' label='' strokeWidth={2} />

        <Tooltip content={CustomTooltip} />
      </ComposedChart>
    )
  }
}

export default MultiLinePlot
