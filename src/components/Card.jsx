import React from 'react'
import classnames from 'classnames'

const Card = ({ children, className }) => (
  <div className={classnames('bg-white py-3 px-3 md:px-4 md:shadow md:rounded-md', className)}>
    {children}
  </div>
)

export default Card
