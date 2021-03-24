import React, { lazy, Suspense } from 'react'
import NavBar from './components/NavBar'
import Spinner from './components/Spinner'

const LazyContainer = lazy(() => import('./components/Covid19'))

const Loading = () => (
  <div className='fixed inset-0 grid place-content-center'>
    <Spinner className='w-10 h-10' />
  </div>
)

function App () {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <NavBar />
        <div className='container md:py-4 flex flex-col'>
          <LazyContainer />
        </div>
      </Suspense>
    </>
  )
}

export default App
