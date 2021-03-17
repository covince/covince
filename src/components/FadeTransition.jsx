import React from 'react'
import { CSSTransition } from 'react-transition-group'

const FadeTransition = (props) =>
  <CSSTransition
    {...props}
    timeout={300}
    mountOnEnter
    unmountOnExit
    classNames={{
      appear: 'opacity-0',
      appearActive: 'transition-opacity duration-300 opacity-100',
      appearDone: '',
      enter: 'opacity-0',
      enterActive: 'transition-opacity duration-300 opacity-100',
      enterDone: '',
      exitActive: 'transition-opacity duration-300 opacity-0',
      exitDone: 'opacity-0'
    }}
  >
    {props.children}
  </CSSTransition>

export default FadeTransition
