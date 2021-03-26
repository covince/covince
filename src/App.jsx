import React, { lazy, Suspense } from 'react'

import NavBar from './components/NavBar'
import Spinner from './components/Spinner'
import AppContainer from './components/AppContainer'

const LazyContent = lazy(() => import('./components/Covid19'))

const Loading = () => (
  <div className='fixed inset-0 grid place-content-center'>
    <Spinner className='w-10 h-10 text-gray-500' />
  </div>
)

function App () {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <NavBar />
        <AppContainer>
          <LazyContent />
        </AppContainer>
      </Suspense>
    </>
  )
}

export default App
