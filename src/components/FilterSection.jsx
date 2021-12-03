import React from 'react'
import classNames from 'classnames'

const FilterSection = ({ className, children }) => (
  <div className={classNames('pb-1.5 mb-1.5 gutterless-scrollbars flex space-x-3 overflow-x-auto overflow-y-hidden xl:overflow-visible pl-1 xl:pl-0', className)}>
    {children}
    <span className='w-px flex-shrink-0 xl:hidden'/> {/* spacer for overflow */}
  </div>
)

export default FilterSection
