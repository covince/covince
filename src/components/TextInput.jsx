import React from 'react'
import classNames from 'classnames'

const TextInput = React.forwardRef(({ className, type = 'text', ...props }, ref) =>
  <input
    ref={ref}
    className={classNames(
      className,
      'h-11 md:h-10 text-base md:text-sm rounded-md border-gray-300 shadow-sm',
      'dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400',
      'focus:primary-ring disabled:bg-gray-100 dark:disabled:bg-gray-500'
    )}
    type={type}
    {...props}
  />
)
TextInput.displayName = 'TextInput'

export default TextInput
