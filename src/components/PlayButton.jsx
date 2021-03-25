import React from 'react'
import classnames from 'classnames'
import { BsPlay, BsPause } from 'react-icons/bs'

import { CircleButton } from './Button'

function PlayButton ({ playing, toggleState, className }) {
  return (
    <CircleButton
      className={classnames(className, 'h-5 w-5 box-content grid place-content-center')}
      onClick={() => toggleState(!playing)}
      title={playing ? 'Pause' : 'Play timeline'}
    >
      { playing
        ? <BsPause className='w-5 h-5 text-gray-500' />
        : <BsPlay className='w-6 h-6 text-gray-500 pl-0.5' /> }
    </CircleButton>
  )
}

export default PlayButton
