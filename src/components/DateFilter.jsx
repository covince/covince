import './DateFilter.css'

import React from 'react'
import { BsPlay, BsPause } from 'react-icons/bs'

import Slider from './Slider'
import Button from './Button'
import { Heading, DescriptiveHeading } from './Typography'

const DateFilter = ({ className, dates = [], heading, label = 'Timeline', value, onChange, persistDate, playing, setPlaying, loading }) => (
  <div className={className}>
    <div className='h-6 flex justify-between items-start'>
      <DescriptiveHeading>
        {label}
      </DescriptiveHeading>
      <Button
        className='fill-current flex items-center covince-timeline-button'
        onClick={() => setPlaying(!playing)}
        disabled={loading}
      >
        { playing
          ? <>
              <span>Pause</span>
              <BsPause />
            </>
          : <>
              <span>Play</span>
              <BsPlay />
            </> }
      </Button>
    </div>
    <Heading className='mt-0.5 h-6'>
      {loading ? <span>Loading data&hellip;</span> : heading}
    </Heading>
    <div className='h-6 mt-1.5'>
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
