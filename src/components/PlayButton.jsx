import React from 'react'
import classnames from 'classnames'
import { BsPlay, BsPause } from 'react-icons/bs'

import Button from './Button'

function PlayButton ({ playing, toggleState, className }) {
  return (
    <Button
      className={classnames(className, 'fill-current flex items-center pl-3 pr-1 h-9')}
      onClick={() => toggleState(!playing)}
    >
      { playing
        ? <>
            <span>Pause</span>
            <BsPause className='w-6 h-6 text-gray-400' />
          </>
        : <>
            <span>Play</span>
            <BsPlay className='w-6 h-6 text-gray-400' />
          </> }
    </Button>
  )
}

export default PlayButton
