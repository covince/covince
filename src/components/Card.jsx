import React from 'react'
import classnames from 'classnames'

const Card = React.forwardRef(({ children, className, style }, ref) => (
  <div
    ref={ref}
    className={classnames('bg-white py-3 px-3 md:px-4 shadow md:rounded-md', className)}
  >
    {children}
  </div>
))

Card.displayName = 'Card'

export default Card
