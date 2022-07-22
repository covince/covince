import React, { useEffect, useMemo } from 'react'
import { format } from 'date-fns'

import { DescriptiveHeading } from './Typography'
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

  const commitValues = () => updateQuery({
    xMin: minValue === 0 ? undefined : dates[minValue],
    xMax: maxValue === dates.length - 1 ? undefined : dates[maxValue]
  })

  useEffect(() => {
    setMinValue(dates.indexOf(xMin) || 0)
    setMaxValue(dates.indexOf(xMax) || dates.length - 1)
  }, [xMin, xMax])

  return (
    <div className='h-20'>
      <header className='flex justify-between items-center'>
        <DescriptiveHeading>Time Period</DescriptiveHeading>
      </header>
      <form>
        <div className='flex justify-center items-baseline mt-0.5 font-bold font-heading whitespace-nowrap text-lg leading-6 h-6'>
          <label>{labels[minValue]}</label>
          <span className='w-full h-1.5 mx-3 self-center border-b border-gray-300 dark:border-gray-500'></span>
          <label>{labels[maxValue]}</label>
        </div>
        <MinMaxSlider
          className='h-6 mt-1.5'
          min={0}
          max={dates.length - 1}
          minValue={minValue}
          maxValue={maxValue}
          onMinChange={setMinValue}
          onMaxChange={setMaxValue}
          onMouseUp={commitValues}
          onKeyUp={commitValues}
        />
      </form>
    </div>
  )
}

export default LineageDateFilter
