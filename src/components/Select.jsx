import './Select.css'

import React from 'react'
import classnames from 'classnames'

/* TODO: add styled menu items for mouse users */
const Select = (props) =>
  <select
    {...props}
    className={classnames(
      props.className, [
        'heron-styled-select',
        'py-2 pl-2 md:pl-3 pr-6 md:pr-10 border border-gray-300 bg-white rounded-md shadow-sm',
        'focus:outline-none focus:ring-gray-500 focus:border-gray-500'
      ]
    )}
  />

export default Select
