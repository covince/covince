import './MultiLinePlot.css'

import React, { useMemo } from 'react'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ComposedChart, Area } from 'recharts'
import format from 'date-fns/format'
import * as tailwindColors from 'tailwindcss/colors'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload) {
    payload.sort((a, b) => {
      if (a.value < b.value) return 1
      if (a.value > b.value) return -1
      return 0
    })
    return (
      <div className='p-3 bg-white shadow rounded-md text-sm leading-5'>
        <h4 className='text-center text-gray-700 font-bold mb-1'>
          {format(new Date(label), 'd MMMM yyyy')}
        </h4>
        <table className='tabular-nums'>
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
                  {item.value.toFixed(3)}
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

const MultiLinePlot = ({ date, setDate, lad_data, parameter, type, width, height = 120, color = 'blueGray', className }) => {
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

  const chartProps = {
    data,
    width,
    height,
    margin: { top: 16, left: 0, right: 24 },
    onClick: ({ activeLabel }) => setDate(activeLabel),
    cursor: 'pointer',
    className
  }

  const grid =
    <CartesianGrid stroke={tailwindColors[color][300]} />

  const dateLine =
    <ReferenceLine
      x={date}
      stroke={tailwindColors[color][400]}
      label=''
      strokeWidth={2}
      style={{ mixBlendMode: 'multiply' }}
    />

  const tooltip =
    <Tooltip
      content={CustomTooltip}
      cursor={{ stroke: tailwindColors[color][300] }}
    />

  const xAxis =
    <XAxis
      dataKey='date'
      fontSize='12'
      tick={data.length}
      tickFormatter={d => format(new Date(d), 'd MMM')}
      tickMargin='4'
      stroke='currentcolor'
    />

  if (type === 'area') {
    return (
      <ComposedChart {...chartProps}>
        {grid}
        {lineages.map((lineage, index) =>
        // eslint-disable-next-line react/jsx-key
          <Area
            key={lineage}
            activeDot={{ stroke: tailwindColors[color][400] }}
            dataKey={lineage}
            dot={false}
            fill={colors[index]}
            isAnimationActive={false}
            name={lineage}
            stackId='1'
            stroke={colors[index]}
            type='monotone'
          />
        )}
        {xAxis}
        <YAxis
          domain={[0, 1]}
          fontSize='12'
          tick={data.length}
          tickFormatter={value => parseFloat(value).toFixed(2)}
          tickMargin='4'
          width={48}
          stroke='currentcolor'
        />
        {dateLine}
        {tooltip}
      </ComposedChart>
    )
  } else {
    return (
      <ComposedChart {...chartProps}>
        {grid}
        {lineages.map((lineage, index) => {
          const key = `${lineage}_range`
          return (
            <Area
              key={key}
              activeDot={false}
              dataKey={key}
              fill={colors[index]}
              isAnimationActive={false}
              name='_range'
              strokeWidth={0}
              type='monotone'
            />
          )
        })}
        {lineages.map((lineage, index) =>
          <Line
            key={lineage}
            activeDot={{ stroke: tailwindColors[color][400] }}
            dataKey={lineage}
            dot={false}
            isAnimationActive={false}
            name={lineage}
            stroke={colors[index]}
            type='monotone'
          />
        )}
        {xAxis}
        <YAxis
          fontSize='12'
          width={48}
          tick={data.length}
          stroke='currentcolor'
          tickMargin='4'
          tickFormatter={d => parseFloat(d).toLocaleString()}
        />
        {dateLine}
        {tooltip}
      </ComposedChart>
    )
  }
}

export default MultiLinePlot
