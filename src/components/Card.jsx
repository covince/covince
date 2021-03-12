import React from 'react'
import classnames from 'classnames'

const Card = ({ children, className }) => (
  <div className={classnames('bg-white shadow rounded-md py-3 px-4', className)}>
    {children}
  </div>
)

export default Card
