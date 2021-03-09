import React from 'react'

import { FaPlay, FaPause } from 'react-icons/fa'

function PlayButton ({ playing, toggleState }) {
  return (
    <button onClick={() => toggleState(!playing)}>
      { playing ? <FaPause /> : <FaPlay />}
    </button>
  )
}

export default PlayButton
