import './Checkbox.css'

import React from 'react'

const Checkbox = ({ id, name, label, checked, onChange, children }) => (
  <div className='heron-checkbox flex items-center'>
    <div className="flex items-center h-5">
      <input
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        type="checkbox"
        className="outline-none focus:ring-2 ring-primary ring-offset-2 h-4 w-4 text-primary border-gray-300 rounded"
      />
    </div>
    <div className='ml-2 text-sm'>
      <label className='font-medium text-gray-700' htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  </div>
)

export default Checkbox
