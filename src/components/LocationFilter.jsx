import React from 'react'

import { Heading, DescriptiveHeading } from './Typography'

const LocationFilter = ({ className, category, heading, subheading, children }) => (
  <div className={className}>
    <DescriptiveHeading className='whitespace-nowrap h-6'>
      {category}
    </DescriptiveHeading>
    <Heading className='flex items-center space-x-3'>
      <span className='truncate' title={heading}>{heading}</span>
    </Heading>
    <p className='text-sm leading-6 mt-1 text-gray-600 font-medium'>
      {subheading}
    </p>
    {children}
  </div>
)

export default LocationFilter
