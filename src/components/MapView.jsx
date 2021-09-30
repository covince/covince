import React from 'react'
import classNames from 'classnames'

const MapView = ({ heading, children, isHidden }) => {
  return (
    <div className={classNames('flex-grow flex flex-col', { hidden: isHidden })}>
      {heading}
      {children}
    </div>
  )
}

export default MapView
