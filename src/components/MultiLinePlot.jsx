import './MultiLinePlot.css'

import React, { useMemo } from 'react'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ComposedChart, Area } from 'recharts'
import format from 'date-fns/format'
import * as tailwindColors from 'tailwindcss/colors'

const formatLargeNumber = number => {
  const fixed = number.toFixed(2)
  return parseFloat(fixed).toLocaleString(undefined, { minimumFractionDigits: 2 })
}

const CustomTooltip = ({ active, payload, label, percentage }) => {
  if (active && payload) {
    payload.sort((a, b) => {
      if (a.value < b.value) return 1
      if (a.value > b.value) return -1
      return 0
    })
    return (
      <div className='p-3 bg-white shadow-md rounded-md text-sm leading-5'>
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
                  {percentage ? `${item.value.toFixed(1)}%` : formatLargeNumber(item.value)}
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

const MultiLinePlot = ({ date, setDate, area_data, colors, parameter, type, width, height = 120, stroke = 'blueGray', className }) => {
  const chart = useMemo(() => {
    const dataByDate = {}
    const lineages = new Set()

    for (const d of area_data) {
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
  }, [area_data])

  const { lineages, data } = chart

  const chartProps = {
    data,
    width,
    height,
    margin: { top: 12, left: 0, right: 24 },
    onClick: item => {
      if (item) {
        setDate(item.activeLabel)
      }
    },
    cursor: 'pointer',
    className
  }

  const percentage = parameter === 'p'
  const yAxisTicks = useMemo(() => ({
    tickFormatter: percentage
      ? value => `${Math.min(parseFloat(value), 100)}%`
      : value => {
        if (value >= 10e3) {
          return `${value.toString().slice(0, 2)}K`
        }
        return value.toLocaleString()
      },
    ticks: percentage
      ? [0, 25, 50, 75, 100]
      : parameter === 'R'
        ? [0, 1, 2, 3]
        : undefined
  }), [percentage, type])

  const yAxisDomain = useMemo(() => {
    if (type === 'area' && parameter === 'p') {
      return [0, 1]
    } else if (parameter === 'R') {
      return [0, 3]
    } else {
      return [0, 'auto']
    }
  }, [type, parameter])

  const grid =
    <CartesianGrid stroke={tailwindColors[stroke][300]} />

  const dateLine =
    <ReferenceLine
      x={date}
      stroke={tailwindColors[stroke][400]}
      label=''
      strokeWidth={2}
      style={{ mixBlendMode: 'multiply' }}
    />

  const tooltip =
    <Tooltip
      content={CustomTooltip}
      percentage={parameter === 'p'}
      cursor={{ stroke: tailwindColors[stroke][type === 'area' ? '500' : '300'] }}
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

  const yAxis =
    <YAxis
      type='number'
      allowDataOverflow={parameter === 'R'}
      domain={yAxisDomain}
      fontSize='12'
      width={48}
      stroke='currentcolor'
      tickMargin='4'
      tick={data.length}
      {...yAxisTicks}
    />

  if (type === 'area') {
    return (
      <ComposedChart {...chartProps}>
        {grid}
        {tooltip /* placed here to put the cursor underneath the dots */}
        {lineages.map((lineage, index) =>
          <Area
            key={lineage}
            activeDot={{ stroke: tailwindColors[stroke][400] }}
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
        {yAxis}
        {dateLine}
      </ComposedChart>
    )
  } else {
    return (
      <ComposedChart {...chartProps} >
        {grid}
        {tooltip /* placed here to put the cursor underneath the dots */}
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
            activeDot={{ stroke: tailwindColors[stroke][400] }}
            dataKey={lineage}
            dot={false}
            isAnimationActive={false}
            name={lineage}
            stroke={colors[index]}
            type='monotone'
          />
        )}
        {xAxis}
        {yAxis}
        {dateLine}
        {parameter === 'R' &&
          <ReferenceLine
            y={1}
            stroke={tailwindColors[stroke][600]}
            strokeDasharray={[8, 8]}
            label=''
            strokeWidth={2}
            style={{ mixBlendMode: 'multiply' }}
          /> }
      </ComposedChart>
    )
  }
}

export default MultiLinePlot
