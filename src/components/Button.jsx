import React from 'react'
import classnames from 'classnames'

export const Button = React.forwardRef(({ as = 'button', ...props }, ref) => (
  React.createElement(as, {
    ...props,
    ref,
    className: classnames(props.className,
      'bg-white dark:bg-gray-600 py-2 px-3 border rounded-md shadow-sm text-sm leading-5',
      'focus:outline-none focus:primary-ring'
    )
  })
))
Button.displayName = 'Button'

export const DefaultButton = React.forwardRef((props, ref) =>
  <Button
    {...props}
    ref={ref}
    className={classnames(props.className,
      'font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 border-gray-300 dark:border-gray-500'
    )}
  />
)
DefaultButton.displayName = 'DefaultButton'

export default DefaultButton

export const PillButton = (props) => (
  <button
    {...props}
    className={classnames(props.className,
      'px-4 p-2 text-sm rounded-full font-bold focus:outline-none'
    )}
  />
)

export const PrimaryPillButton = (props) => (
  <PillButton
    {...props}
    className={classnames(
      'bg-primary dark:bg-dark-primary text-white dark:text-gray-900',
      props.className
    )}
  />
)

export const SecondaryPillButton = (props) => (
  <PillButton
    {...props}
    className={classnames(
      'border border-gray-300 dark:border-gray-400 text-gray-700 dark:text-current',
      props.className
    )}
  />
)

export const CircleButton = (props) => (
  <button
    {...props}
    className={classnames(props.className,
      'bg-white p-1 border border-gray-300 rounded-full shadow-sm',
      'text-sm leading-5 font-medium text-gray-700',
      'hover:bg-gray-50 focus:outline-none focus:border-primary focus:ring focus:ring-offset-0 focus:ring-primary focus:ring-opacity-40'
    )}
  />
)

export const InlineButton = (props) => (
  <button
    {...props}
    className={classnames(props.className,
      'text-xs uppercase tracking-wider rounded flex items-center font-bold text-primary',
      'focus:outline-none focus:ring focus:ring-offset-0 focus:ring-primary focus:ring-opacity-40'
    )}
  />
)
