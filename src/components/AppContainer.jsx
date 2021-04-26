import classNames from 'classnames'
import React from 'react'

const AppContainer = props => (
  <main
    {...props}
    className={classNames('flex flex-col relative', props.className)}
  />
)

export default AppContainer
