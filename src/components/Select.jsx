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
        'block w-full py-2 pl-2 lg:pl-3 pr-6 lg:pr-10',
        'border border-gray-300 bg-white rounded-md shadow-sm',
        'focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary'
      ]
    )}
  />

export default Select
