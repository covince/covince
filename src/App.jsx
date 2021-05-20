import React, { Suspense } from 'react'

import NavBar from './components/NavBar'
import Spinner from './components/Spinner'
import AppContainer from './components/AppContainer'
import CovInce from './CovInce'

import config from './demo-config.json'

const Loading = () => (
  <div className='fixed inset-0 grid place-content-center'>
    <Spinner className='w-6 h-6 text-gray-500' />
  </div>
)

function App () {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <NavBar />
        <AppContainer>
          <CovInce config={config} />
        </AppContainer>
      </Suspense>
    </>
  )
}

export default App
