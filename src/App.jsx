import './App.css'

import React, { lazy, Suspense } from 'react'
import NavBar from './components/NavBar'
import Spinner from './components/Spinner'

const LazyContainer = lazy(() => import('./components/Covid19'))

function App () {
  return (
    <>
      <NavBar />
      <div className='container mx-auto p-6'>
        <Suspense fallback={<Spinner />}>
          <LazyContainer />
        </Suspense>
      </div>
    </>
  )
}

export default App
