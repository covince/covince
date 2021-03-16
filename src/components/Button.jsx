import React from 'react'
import classnames from 'classnames'

const Button = (props) => (
  <button
    {...props}
    className={classnames(props.className, [
      'bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm',
      'text-sm leading-5 font-medium text-gray-700',
      'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
    ])}
  />
)

export default Button
