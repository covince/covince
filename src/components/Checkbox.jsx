import './Checkbox.css'

import React from 'react'
import classNames from 'classnames'
import { FaCheck as CheckMark } from 'react-icons/fa'

const Checkbox = ({ id, name, children, label = children, checked, onChange, className, style }) => (
  <div className={classNames('flex items-center', className)} style={style}>
    <div className="flex items-center justify-center h-5 relative">
      <input
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        type="checkbox"
        className="covince-checkbox outline-none focus:ring-2 focus:ring-current dark:focus:ring-offset-gray-700 ring-offset-2 h-4 w-4 text-current border-gray-300 rounded"
      />
      { checked && <CheckMark className='absolute h-2.5 w-2.5 stroke-current text-white pointer-events-none dark:text-gray-800' /> }
    </div>
    { label &&
      <label className='pl-2 text-sm font-medium text-gray-700 dark:text-gray-200 leading-none' htmlFor={id}>
        {label}
      </label> }
  </div>
)

export default Checkbox
