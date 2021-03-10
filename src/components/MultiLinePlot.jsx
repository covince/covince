import './MultiLinePlot.css'

import React, { useMemo } from 'react'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ComposedChart, Area } from 'recharts'
import format from 'date-fns/format'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload) {
    return (
      <div className='p-3 bg-white shadow rounded-md text-sm leading-5'>
        <h4 className='text-center text-gray-700 font-medium mb-1'>
          {format(new Date(label), 'do MMMM yyyy')}
        </h4>
        <table>
          <thead className='sr-only'>
            <tr>
              <th>Color</th>
              <th>Lineage</th>
              <th>Value</th>
            </tr>
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

const colors = ['red', 'green', 'blue', 'orange', 'pink', 'aqua', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']

const MultiLinePlot = ({ date, lad_data, parameter, type, width }) => {
  const chart = useMemo(() => {
    const dataByDate = {}
    const lineages = new Set()

    for (const d of lad_data) {
      if (d.parameter === parameter && d.lineage !== 'total') {
        dataByDate[d.date] = {
          ...dataByDate[d.date],
          date: d.date,
          [d.lineage]: d.mean,
          [`${d.lineage}_range`]: d.range
        }
        lineages.add(d.lineage)
      }
    }

    return {
      lineages: Array.from(lineages),
      data: Object.values(dataByDate)
    }
  }, [lad_data])

  const { lineages, data } = chart

  if (type === 'area') {
    return (
      <ComposedChart data={data} width={width} height={240}>
        <CartesianGrid stroke='rgb(203, 213, 225)' />
        {lineages.map((lineage, index) =>
          // eslint-disable-next-line react/jsx-key
          <Area
            // key={value}
            dataKey={lineage}
            fill={colors[index]}
            stroke={colors[index]}
            dot={false}
            isAnimationActive={false}
            stackId='1'
            name={lineage}
            type='monotone'
          />
        )}
        <XAxis dataKey='date' fontSize='14' tickFormatter={d => new Date(d).toLocaleDateString()} />
        <YAxis
          tickFormatter={value => parseFloat(value).toFixed(2)}
          domain={[0, 1]}
          fontSize='14'
          width={32}
        />
        <ReferenceLine x={date} stroke='#94a3b8' label='' strokeWidth={2} />
        <Tooltip content={CustomTooltip} />
      </ComposedChart>
    )
  } else {
    return (
      <ComposedChart data={data} width={width} height={240} margin={{ left: 0, right: 0 }}>
        <CartesianGrid stroke='rgb(203, 213, 225)' />

        {lineages.map((lineage, index) =>
          // eslint-disable-next-line react/jsx-key
          <Area
            // key={value}
            isAnimationActive={false}
            type='monotone'
            name='_range'
            dataKey={`${lineage}_range`}
            fill={colors[index]}
            strokeWidth={0}
          />
        )}
        {lineages.map((lineage, index) =>
          // eslint-disable-next-line react/jsx-key
          <Line
            // key={value}
            isAnimationActive={false}
            dot={false}
            name={lineage}
            type='monotone'
            dataKey={lineage}
            stroke={colors[index]}
          />
        )}

        <XAxis dataKey='date' fontSize='14' tickFormatter={d => new Date(d).toLocaleDateString()} />
        <YAxis fontSize='14' width={32} />
        <ReferenceLine x={date} stroke='#94a3b8' label='' strokeWidth={2} />
        <Tooltip content={CustomTooltip} />
      </ComposedChart>
    )
  }
}

export default MultiLinePlot
