import React from 'react'
import classNames from 'classnames'
import format from 'date-fns/format'

import useNomenclature from '../hooks/useNomenclature'

import { useConfig } from '../config'

const formatNumber = (number, percentage, precision = percentage ? 1 : 2) => {
  const fixed = number.toFixed(precision)
  if (percentage) return `${Number.isInteger(number) ? number : fixed}%`
  return parseFloat(fixed).toLocaleString(undefined, { minimumFractionDigits: precision })
}

const formatLineage = lineageWithMuts => {
  const [lineage, ...muts] = lineageWithMuts.split('+')
  return (
    muts.length === 0
      ? lineage
      : <span className='leading-4'>
          {lineage}
          {muts.map((mut, i) => (
            <>
              <span key={mut} className={classNames('text-xs tracking-wide leading-none text-gray-600 dark:text-gray-200', { block: muts.length === 1 })}>
                +{mut}
              </span>
              {i === 0 && muts.length > 1 && <br className='leading-none'/>}
            </>
          ))}
        </span>
  )
}

const UncertaintyRange = ({ item, percentage, precision }) => {
  const range = item.payload[`${item.name}_range`]
  if (range && range[0] !== null && range[1] !== null) {
    return (
      <>
        <td className='text-xs tracking-wide text-gray-600 dark:text-gray-200 text-right pl-3'>
          {formatNumber(range[0], percentage, precision)}
        </td>
        <td className='text-xs tracking-wide text-gray-600 dark:text-gray-200 text-center'>
          &ndash;
        </td>
        <td className='text-xs tracking-wide text-gray-600 dark:text-gray-200 text-left'>
          {formatNumber(range[1], percentage, precision)}
        </td>
      </>
    )
  }
  return <><td /><td /><td /></>
}

const ChartTooltip = ({ active, payload, label, percentage, precision = {}, dates, sortByValue = true, highlightedItem }) => {
  const config = useConfig()
  const { nomenclatureLookup } = useNomenclature()
  if (active && payload) {
    const _payload = payload.filter(_ => _.value > 0)
    if (sortByValue) {
      _payload.sort((a, b) => {
        if (a.value < b.value) return 1
        if (a.value > b.value) return -1
        return 0
      })
    } else {
      _payload.reverse()
    }
    const { timeline, chart } = config
    const { tooltip } = chart.settings
    return (
      <div
        className={`
          p-3 bg-white dark:bg-gray-600 shadow-md rounded-md text-sm leading-5
          ring-1 ring-black dark:ring-gray-500 ring-opacity-5
        `}
      >
        <h4 className='text-center text-gray-700 dark:text-gray-300 font-bold mb-1'>
          {format(new Date(dates[label]), timeline.date_format.chart_tooltip)}
        </h4>
        <table className='tabular-nums w-full'>
          <thead className='sr-only'>
            <tr>
              <th>Color</th>
              <th>Name/Lineage</th>
              <th>Value</th>
              <th>Uncertainty Min.</th>
              <th></th>
              <th>Uncertainty Max.</th>
            </tr>
          </thead>
          <tbody>
          {_payload.length === 0 &&
            <tr>
              <td colSpan={3} className='text-center text-gray-700 dark:text-gray-300'>No data</td>
            </tr>}
          {_payload.map(item => {
            if (item.name === '_range') {
              return null
            }
            return (
              <tr key={item.name} className={classNames({ 'font-bold': item.name === highlightedItem })}>
                <td>
                  <i className='block rounded-full h-3 w-3' style={{ backgroundColor: item.stroke }} />
                </td>
                <td className='px-3 leading-none'>
                  {formatLineage(
                    tooltip.use_nomenclature
                      ? nomenclatureLookup[item.name] || item.name
                      : item.name
                  )}
                </td>
                <td className='text-right'>
                  {formatNumber(item.value, percentage, precision.mean)}
                </td>
                <UncertaintyRange
                  item={item}
                  percentage={percentage}
                  precision={precision.range}
                />
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

export default ChartTooltip
