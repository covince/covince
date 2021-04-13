import React, { lazy, Suspense } from 'react'
import NavBar from './components/NavBar'
import Spinner from './components/Spinner'
import AppContainer from './components/AppContainer'

const DataProvider = lazy(() => import('./components/DataProvider'))
const Covid19 = lazy(() => import('./components/Covid19'))

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
            <DataProvider url="./data/lists.json">
              <Covid19 />
            </DataProvider>
        </AppContainer>
      </Suspense>
    </>
  )
}

export default App
