import React from 'react'
import classNames from 'classnames'

const TextInput = React.forwardRef(({ className, type = 'text', ...props }, ref) =>
  <input
    ref={ref}
    className={classNames(
      className,
      'h-11 md:h-9 text-base md:text-sm rounded-md border-gray-300 shadow-sm',
      'focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-40',
      'dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400',
      'dark:focus:border-dark-primary dark:focus:ring-dark-primary dark:focus:ring-opacity-40'
    )}
    type={type}
    {...props}
  />
)
TextInput.displayName = 'TextInput'

export default TextInput
