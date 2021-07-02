import React from 'react'
import classnames from 'classnames'
import { HiChevronDown } from 'react-icons/hi'

/* TODO: add styled menu items for mouse users */
const Select = ({ chevronClass = 'text-gray-500 dark:text-gray-300', ...props }) =>
  <span className='relative flex items-center'>
    <select
      {...props}
      className={classnames(
        props.className,
        'block w-full py-2 pl-2 lg:pl-3 pr-6 lg:pr-10 text-sm bg-none',
        'border border-gray-300 bg-white rounded-md shadow-sm',
        'focus:outline-none focus:border-primary focus:ring focus:ring-offset-0 focus:ring-primary focus:ring-opacity-40',
        'dark:border-gray-500 dark:bg-gray-600 dark:focus:border-dark-primary dark:focus:ring-dark-primary dark:focus:ring-opacity-40'
      )}
    />
    <HiChevronDown
      className={classnames(
        'h-5 w-5 absolute right-1.5 lg:right-2.5 fill-current pointer-events-none',
        chevronClass
      )}
    />
  </span>

export default Select
