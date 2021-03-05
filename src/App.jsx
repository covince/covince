import React from 'react'
import NavBar from './components/NavBar'
import 'rc-slider/assets/index.css'
import './App.css'
import ContainerWithTimer from './components/ContainerWithTimer'

function App () {
  document.getElementById('spinner').style.display = 'none'
  return (
    <>
      <NavBar />
      <div className='container'>

        <ContainerWithTimer />
      </div>
    </>
  )
}

export default App
