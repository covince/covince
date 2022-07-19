import React from 'react'
import classNames from 'classnames'
import { FaCheck, FaCircle } from 'react-icons/fa'

const types = {
  checkbox: 'checkbox',
  radio: 'radio'
}

const icons = {
  checkbox: FaCheck,
  radio: FaCircle
}

const Checkbox = ({ id, name, type = types.checkbox, children, label = children, checked, onChange, className, style, disabled, title }) => {
  const Checked = icons[type] || icons.checkbox
  return (
    <div className={classNames('flex items-center', className)} style={style} title={title}>
      <div className="flex items-center justify-center h-5 relative">
        <input
          checked={checked}
          className={classNames(
            'covince-checkbox checked:bg-none outline-none focus:ring-2 focus:ring-current dark:focus:ring-offset-gray-700 ring-offset-2 h-4 w-4 text-current border-gray-300 disabled:bg-gray-200',
            {
              'rounded-full': type === types.radio,
              rounded: type === types.checkbox
            }
          )}
          disabled={disabled}
          id={id}
          name={name}
          onChange={onChange}
          type={type}
        />
        { checked &&
          <Checked
            className={classNames(
              'absolute stroke-current text-white pointer-events-none',
              {
                'h-2.5 w-2.5 dark:text-gray-800': type === types.checkbox,
                'h-1.5 w-1.5 dark:text-gray-700': type === types.radio
              }
            )}
          /> }
      </div>
      { label &&
        <label className='pl-2 text-sm font-medium text-gray-700 dark:text-gray-200 leading-none min-w-0 truncate' htmlFor={id}>
          {label}
        </label> }
    </div>
  )
}

export default Checkbox
