import './LocationFilter.css'

import React, { useCallback } from 'react'
import { BsArrowUpShort } from 'react-icons/bs'
import { HiChevronDown } from 'react-icons/hi'

import { Heading, DescriptiveHeading } from './Typography'
import Spinner from './Spinner'
import FadeTransition from './FadeTransition'

const Select = ({ label, children, value, onChange }) => {
  const _onChange = useCallback((e) => {
    if (e.target.value) {
      onChange(e.target.value)
    }
  }, [onChange])

  return (
    <div className='relative max-w-max covince-location-select'>
      <select className='appearance-none bg-white absolute left-0 top-0 w-full h-6 opacity-0 text-sm' value={value} onChange={_onChange} title={label}>
        {children}
      </select>
      <Heading className='flex items-center justify-between space-x-2 relative z-0 pointer-events-none h-6'>
        <span className='truncate select-none'>{label}</span>
        <HiChevronDown className='flex-shrink-0 h-5 w-5 p-px pt-0.5 box-content border border-gray-300 rounded-md text-current shadow-sm covince-location-select-focus' />
      </Heading>
    </div>
  )
}

const LocationFilter = ({ className, loading, value, areaList, onChange, category, heading, subheading, showOverviewButton, loadOverview, overview }) => (
  <div className={className}>
    <div className='flex justify-between items-center h-6'>
      <DescriptiveHeading className='whitespace-nowrap'>
        {category}
      </DescriptiveHeading>
      {showOverviewButton && <button
        title='Return to overview'
        className='py-0 pr-1 text-xs uppercase tracking-wider rounded flex items-center font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none relative z-10'
        onClick={loadOverview}
      >
        <BsArrowUpShort className=' h-6 w-6 fill-current' />
        {overview.short_text}
      </button> }
    </div>
    <Select value={value} onChange={onChange} label={heading}>
      <option value='overview'>{overview.heading}</option>
      <option value=''>-----</option>
      {areaList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
    </Select>
    <p className='text-sm leading-6 h-6 mt-1 text-gray-600 font-medium'>
      {subheading}
    </p>
    <FadeTransition in={loading}>
      <div className='bg-white absolute inset-0 grid place-content-center z-10'>
        <Spinner className='text-gray-500 w-6 h-6' />
      </div>
    </FadeTransition>
  </div>
)

export default LocationFilter
