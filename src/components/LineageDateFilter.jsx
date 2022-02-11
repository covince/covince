import React, { useMemo } from 'react'
import { format } from 'date-fns'
import classNames from 'classnames'

import { DescriptiveHeading } from './Typography'
import Button from './Button'
import Select from './Select'

import useQueryAsState from '../hooks/useQueryAsState'

const LineageDateFilter = ({ dates = [] }) => {
  const defaultValues = dates.length
    ? {
        xMin: dates[0],
        xMax: dates[dates.length - 1]
      }
    : {}
  const [{ xMin, xMax }, updateQuery] = useQueryAsState(defaultValues)

  const options = useMemo(() => {
    return dates.map(d => ({ value: d, label: format(new Date(d), 'dd MMM y') }))
  }, [dates])

  const [fromOptions, toOptions] = useMemo(() => {
    const fromItem = options.find(_ => _.value === xMin)
    const toItem = options.find(_ => _.value === xMax)
    return [
      toItem ? options.slice(0, options.indexOf(toItem) + 1) : options,
      fromItem ? options.slice(options.indexOf(fromItem)) : options
    ]
  }, [xMin, xMax])

  return (
    <div className='h-20'>
      <header className='flex justify-between items-center'>
        <DescriptiveHeading>Time Period</DescriptiveHeading>
        <Button
          disabled={xMin === defaultValues.xMin && xMax === defaultValues.xMax}
          className='flex items-center h-6 px-2 disabled:text-gray-500 dark:disabled:text-gray-400'
          onClick={() => updateQuery({ xMin: undefined, xMax: undefined })}
        >
          Reset dates
        </Button>
      </header>
      <form className='mt-3 flex items-baseline text-sm space-x-3'>
        <div className='w-1/2'>
          <label className='block font-medium mb-1 sr-only'>
            From Date
          </label>
          <Select
            className={classNames(xMin === defaultValues.xMin ? 'text-gray-600 dark:text-gray-300' : 'font-medium')}
            value={xMin}
            name='lineages from date'
            onChange={e => updateQuery({ xMin: e.target.value === defaultValues.xMin ? undefined : e.target.value })}
          >
            {fromOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
        </div>
        <p>to</p>
        <div className='w-1/2'>
          <label className='block font-medium mb-1 sr-only'>
            To Date
          </label>
          <Select
            className={classNames(xMax === defaultValues.xMax ? 'text-gray-600 dark:text-gray-300' : 'font-medium')}
            value={xMax}
            name='lineages to date'
            onChange={e => updateQuery({ xMax: e.target.value === defaultValues.xMax ? undefined : e.target.value })}
          >
            {toOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
        </div>
      </form>
    </div>
  )
}

export default LineageDateFilter
