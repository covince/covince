import React from 'react'
import classnames from 'classnames'

import { BsPlay, BsPause } from 'react-icons/bs'

function PlayButton ({ playing, toggleState, className }) {
  return (
    <button
      className={classnames([
        'fill-current text-gray-600 rounded flex items-center',
        'text-xs font-medium tracking-wide uppercase',
        'h-8 border border-solid border-gray-300',
        className
      ])}
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
    </button>
  )
}

export default PlayButton
