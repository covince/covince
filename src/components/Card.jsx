import React from 'react'
import classnames from 'classnames'

const Card = React.forwardRef(({ children, className, extraPadding }, ref) => (
  <div
    ref={ref}
    className={classnames(
      'bg-white dark:bg-gray-700 py-3 px-3 shadow md:rounded-md',
      extraPadding ? 'md:px-6 md:py-6' : 'md:px-4',
      className
    )}
  >
    {children}
  </div>
))

Card.displayName = 'Card'

export default Card
