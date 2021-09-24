import React from 'react'
import classNames from 'classnames'

const MapView = ({ children, isHidden }) => {
  return (
    <div className={classNames('flex-grow flex flex-col', { hidden: isHidden })}>
      {children}
    </div>
  )
}

export default MapView
