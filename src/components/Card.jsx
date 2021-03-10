import React from 'react'
import classnames from 'classnames'

const Card = ({ children, className }) => (
  <div className={classnames('bg-white shadow rounded-md p-3', className)}>
    {children}
  </div>
)

export default Card
