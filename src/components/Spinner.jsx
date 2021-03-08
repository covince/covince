import './Spinner.css'

import React from 'react'

const Spinner = () => {
  return (
    <div id="spinner" className='fixed top-0 bottom-0 left-0 right-0 grid place-content-center'>
      <div className="lds-ring text-sanger-medium-blue">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}

export default Spinner
