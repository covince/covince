import React from 'react'
import classNames from 'classnames'

import FadeTransition from './FadeTransition'
import Spinner from './Spinner'

const LoadingOverlay = ({ as = 'div', className, children, loading, ...props }) => (
  React.createElement(as, {
    className: classNames('relative', className),
    ...props
  }, (
    <>
      {children}
      <FadeTransition in={loading}>
        <div className='bg-white bg-opacity-75 dark:bg-gray-700 dark:bg-opacity-75 absolute inset-0 grid place-content-center'>
          <Spinner className='text-gray-500 dark:text-gray-200 w-6 h-6' />
        </div>
      </FadeTransition>
    </>
  ))
)

export default LoadingOverlay
