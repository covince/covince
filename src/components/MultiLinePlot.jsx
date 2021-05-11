import './MultiLinePlot.css'

import React, { useMemo } from 'react'
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis } from 'victory'
import format from 'date-fns/format'
import * as tailwindColors from 'tailwindcss/colors'
import classNames from 'classnames'
import { orderBy } from 'lodash'

import useQueryAsState from '../hooks/useQueryAsState'

const formatLargeNumber = number => {
  const fixed = number.toFixed(2)
  return parseFloat(fixed).toLocaleString(undefined, { minimumFractionDigits: 2 })
}

const CustomTooltip = ({ active, payload, label, percentage }) => {
  if (active && payload) {
    const _payload = payload.filter(_ => _.value > 0)
    _payload.sort((a, b) => {
      if (a.value < b.value) return 1
      if (a.value > b.value) return -1
      return 0
    })
    return (
      <div className='p-3 bg-white shadow-md rounded-md text-sm leading-5 ring-1 ring-black ring-opacity-5'>
        <h4 className='text-center text-gray-700 font-bold mb-1'>
          {format(new Date(label), 'd MMMM yyyy')}
        </h4>
        <table className='tabular-nums w-full'>
          <thead className='sr-only'>
            <tr>
              <th>Color</th>
              <th>Lineage</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
          {_payload.length === 0 && <tr><td colSpan={3} className='text-center text-gray-700'>No data</td></tr>}
          {_payload.map(item => {
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

const MultiLinePlot = props => {
  const animationDuration = 500

  const {
    parameter, preset = parameter === 'p' ? 'percentage' : null, // back compat
    yAxis: yAxisConfig = {}, xAxis: xAxisConfig = {},
    date, setDate, area_data, activeLineages,
    type, width, height = 120, stroke = 'blueGray', className
  } = props

  const [{ xMin, xMax }, updateQuery] = useQueryAsState()

  const lines = useMemo(() => {
    const linesByLineage = {}

    for (const d of area_data) {
      if (!(d.lineage in activeLineages)) continue
      const { active, colour } = activeLineages[d.lineage]
      if (active && d.parameter === parameter && d.lineage !== 'total') {
        const line = linesByLineage[d.lineage] || {
          key: d.lineage,
          data: [],
          style: {
            data: { stroke: colour, strokeWidth: 1 }
          }
        }
        line.data.push({ x: d.date, y: d.mean })
        linesByLineage[d.lineage] = line
      }
    }

    return Object.values(linesByLineage)
  }, [area_data, activeLineages, xMax])

  return (
    <div>
      <VictoryChart
        width={width}
        height={height}
        domainPadding={0}
        animate={{ duration: animationDuration }}
        padding={{ top: 24, left: 48, right: 24, bottom: 36 }}
        theme={VictoryTheme.material}
      >
        <VictoryAxis fixLabelOverlap tickFormat={(tick) => format(new Date(tick), 'd MMM')} />
        <VictoryAxis dependentAxis tickCount={4} />
        {lines.map(line => <VictoryLine key={line.key} {...line} interpolation='monotoneX' />)}
      </VictoryChart>
    </div>
  )
}

export default MultiLinePlot
