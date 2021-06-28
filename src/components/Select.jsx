import './Select.css'

import React from 'react'
import classnames from 'classnames'

/* TODO: add styled menu items for mouse users */
const Select = (props) =>
  <select
    {...props}
    className={classnames(
      props.className, [
        'covince-styled-select',
        'block w-full py-2 pl-2 lg:pl-3 pr-6 lg:pr-10 text-sm',
        'border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 rounded-md shadow-sm',
        'focus:outline-none focus:border-primary dark:focus:border-primary focus:ring focus:ring-offset-0 focus:ring-primary focus:ring-opacity-40'
      ]
    )}
  />

export default Select
