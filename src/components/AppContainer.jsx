import classNames from 'classnames'
import React from 'react'

const AppContainer = props => (
  <main
    {...props}
    className={classNames('app-container md:py-4 flex flex-col', props.className)}
  />
)

export default AppContainer
