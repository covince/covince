import './Checkbox.css'

import React from 'react'
import classNames from 'classnames'

const Checkbox = ({ id, name, label, checked, onChange, className, style, children }) => (
  <div className={classNames('heron-checkbox flex items-center', className)} style={style}>
    <div className="flex items-center h-5">
      <input
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        type="checkbox"
        className="outline-none focus:ring-2 ring-current ring-offset-2 h-4 w-4 text-current border-gray-300 rounded"
      />
    </div>
    <div className='text-sm'>
      <label className='pl-2 font-medium text-gray-700' htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  </div>
)

export default Checkbox
