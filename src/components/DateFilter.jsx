import React from 'react'

import Slider from './Slider'
import PlayButton from './PlayButton'
import { Heading, DescriptiveHeading } from './Typography'
import Spinner from './Spinner'

const DateFilter = ({ className, dates, label, value, onChange, playing, setPlaying }) => (
  <div className={className}>
    {dates
      ? <>
        <div className='h-6 flex justify-between items-start'>
          <DescriptiveHeading>
            Select date
          </DescriptiveHeading>
          <PlayButton
            playing={playing}
            toggleState={setPlaying}
          />
        </div>
        <div className='flex items-center justify-between h-6'>
          <Heading>{label}</Heading>
        </div>
        <div className='h-6 mt-2'>
          <Slider
            min={0}
            max={dates.length - 1}
            onChange={onChange}
            value={dates.indexOf(value)}
            disabled={!dates}
          />
        </div>
      </>
      : <div className='h-20 grid place-content-center'>
        <Spinner className='text-gray-700 w-6 h-6' />
      </div>}
  </div>
)

export default DateFilter
