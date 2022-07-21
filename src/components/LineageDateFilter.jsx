import React, { useEffect, useMemo } from 'react'
import { format } from 'date-fns'

import { DescriptiveHeading } from './Typography'
import Button from './Button'
import MinMaxSlider from './MinMaxSlider'

import useQueryAsState from '../hooks/useQueryAsState'

const LineageDateFilter = ({ dates = [] }) => {
  const defaultValues = dates.length
    ? {
        xMin: dates[0],
        xMax: dates[dates.length - 1]
      }
    : {}
  const [{ xMin, xMax }, updateQuery] = useQueryAsState(defaultValues)

  const labels = useMemo(() => {
    return dates.map(d => format(new Date(d), 'd MMM y'))
  }, [dates])

  const [minValue, setMinValue] = React.useState(dates.indexOf(xMin) || 0)
  const [maxValue, setMaxValue] = React.useState(dates.indexOf(xMax) || dates.length - 1)

  const commitValues = () => updateQuery({ xMin: dates[minValue], xMax: dates[maxValue] })

  useEffect(() => {
    setMinValue(dates.indexOf(xMin) || 0)
    setMaxValue(dates.indexOf(xMax) || dates.length - 1)
  }, [xMin, xMax])

  // const [fromOptions, toOptions] = useMemo(() => {
  //   const fromItem = options.find(_ => _.value === xMin)
  //   const toItem = options.find(_ => _.value === xMax)
  //   return [
  //     toItem ? options.slice(0, options.indexOf(toItem) + 1) : options,
  //     fromItem ? options.slice(options.indexOf(fromItem)) : options
  //   ]
  // }, [xMin, xMax])

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
      <form>
        <div className='flex justify-between items-baseline my-1 font-bold font-heading text-sm'>
          <label className='h-6 leading-6'>{labels[minValue]}</label>
          <label className='h-6 leading-6'>{labels[maxValue]}</label>
        </div>
        <MinMaxSlider
          className='h-6'
          min={0}
          max={dates.length - 1}
          minValue={minValue}
          maxValue={maxValue}
          onMinChange={e => setMinValue(e.target.value)}
          onMaxChange={e => setMaxValue(e.target.value)}
          onMouseUp={commitValues}
          onKeyUp={commitValues}
        />
      </form>
    </div>
  )
}

export default LineageDateFilter
