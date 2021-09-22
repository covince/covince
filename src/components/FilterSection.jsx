import React from 'react'
import classNames from 'classnames'

import Spinner from './Spinner'

const FilterSection = ({ className, children, loading }) => (
  <div className={classNames('pb-1.5 mb-1.5 gutterless-scrollbars flex space-x-3 overflow-x-auto overflow-y-hidden xl:overflow-visible pl-1 xl:pl-0', className)}>
    { loading
      ? <div className='h-20 w-10 mb-6 flex justify-center items-start self-start'>
          <Spinner className='block w-5 h-5 text-white'/>
        </div>
      : <>
        {children}
        <span className='w-px flex-shrink-0 xl:hidden'/> {/* spacer for overflow */}
      </> }
  </div>
)

export default FilterSection
