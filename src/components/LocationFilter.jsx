import React from 'react'
import { BsArrowUpShort } from 'react-icons/bs'

import { Heading, DescriptiveHeading } from './Typography'

const LocationFilter = ({ className, category, heading, subheading, showNationalButton, loadNationalOverview }) => (
  <div className={className}>
    <div className='flex justify-between items-center h-6'>
      <DescriptiveHeading className='whitespace-nowrap'>
        {category}
      </DescriptiveHeading>
      {showNationalButton && <button
        title='Return to national overview'
        className='py-0 px-1 text-xs uppercase tracking-wider rounded flex items-center font-bold text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none'
        onClick={loadNationalOverview}
      >
        <BsArrowUpShort className=' h-6 w-6 mr-0.25 fill-current' />
        National
      </button> }
    </div>
    <Heading className='flex items-center space-x-3'>
      <span className='truncate' title={heading}>{heading}</span>
    </Heading>
    <p className='text-sm leading-6 mt-1 text-gray-600 font-medium'>
      {subheading}
    </p>
  </div>
)

export default LocationFilter
