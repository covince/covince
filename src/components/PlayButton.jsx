import React from 'react'
import classnames from 'classnames'

import { BsPlay, BsPause } from 'react-icons/bs'

function PlayButton ({ playing, toggleState }) {
  return (
    <button
      className={classnames([
        'fill-current text-gray-500 rounded flex items-center',
        'text-xs font-medium tracking-wide uppercase'
      ])}
      onClick={() => toggleState(!playing)}
    >
      { playing
        ? <>
            <span>Pause</span>
            <BsPause className='w-6 h-6' />
          </>
        : <>
            <span>Play</span>
            <BsPlay className='w-6 h-6' />
          </> }
    </button>
  )
}

export default PlayButton
