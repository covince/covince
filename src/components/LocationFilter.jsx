import React from 'react'
import { BsArrowUpShort } from 'react-icons/bs'

import { Heading, DescriptiveHeading } from './Typography'
import Spinner from './Spinner'
import FadeTransition from './FadeTransition'

const LocationFilter = ({ className, loading, category, heading, subheading, showOverviewButton, loadOverview, overviewButtonText }) => (
  <div className={className}>
    <div className='flex justify-between items-center h-6'>
      <DescriptiveHeading className='whitespace-nowrap'>
        {category}
      </DescriptiveHeading>
      {showOverviewButton && <button
        title='Return to overview'
        className='py-0 px-1 text-xs uppercase tracking-wider rounded flex items-center font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none'
        onClick={loadOverview}
      >
        <BsArrowUpShort className=' h-6 w-6 mr-0.25 fill-current' />
        {overviewButtonText}
      </button> }
    </div>
    <Heading className='flex items-center space-x-3 h-6'>
      <span className='truncate' title={heading}>{heading}</span>
    </Heading>
    <p className='text-sm leading-6 h-6 mt-1 text-gray-600 font-medium'>
      {subheading}
    </p>
    <FadeTransition in={loading}>
      <div className='bg-white absolute inset-0 grid place-content-center'>
        <Spinner className='text-gray-500 w-6 h-6' />
      </div>
    </FadeTransition>
  </div>
)

export default LocationFilter
