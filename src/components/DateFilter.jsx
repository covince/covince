import React from 'react'
import { BsPlay, BsPause } from 'react-icons/bs'

import Slider from './Slider'
import Button from './Button'
import { Heading, DescriptiveHeading } from './Typography'

const DateFilter = ({ className, dates = [], label, value, onChange, persistDate, playing, setPlaying }) => (
  <div className={className}>
    <div className='h-6 flex justify-between items-start'>
      <DescriptiveHeading>
        Select date
      </DescriptiveHeading>
      <Button
        className='fill-current flex items-center pl-3 pr-1 h-9'
        onClick={() => setPlaying(!playing)}
      >
        { playing
          ? <>
              <span>Pause</span>
              <BsPause className='w-6 h-6 text-gray-400' />
            </>
          : <>
              <span>Play</span>
              <BsPlay className='w-6 h-6 text-gray-400' />
            </> }
      </Button>
    </div>
    <div className='flex items-center justify-between h-6'>
      <Heading>{label}</Heading>
    </div>
    <div className='h-6 mt-2'>
      <Slider
        min={0}
        max={dates ? dates.length - 1 : 1}
        onChange={onChange}
        value={dates ? dates.indexOf(value) : 0.5}
        disabled={!dates}
        onMouseUp={persistDate}
        onTouchEnd={persistDate}
        onKeyUp={persistDate}
      />
    </div>
  </div>
)

export default DateFilter
