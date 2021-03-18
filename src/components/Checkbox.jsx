import './Checkbox.css'

import React from 'react'

const Checkbox = ({ id, name, label, checked, onChange, children }) => (
  <div className='flex items-start'>
    <div className="flex items-center h-5">
      <input
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        type="checkbox"
        className="outline-none focus:ring-2 ring-gray-500 ring-offset-2 h-4 w-4 text-gray-500 border-gray-300 rounded"
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
