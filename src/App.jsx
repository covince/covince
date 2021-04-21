import React, { Suspense } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import NavBar from './components/NavBar'
import Spinner from './components/Spinner'
import AppContainer from './components/AppContainer'
import Covince from './Covince'

const queryClient = new QueryClient()

const Loading = () => (
  <div className='fixed inset-0 grid place-content-center'>
    <Spinner className='w-6 h-6 text-gray-500' />
  </div>
)

function App () {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<Loading />}>
          <NavBar />
          <AppContainer>
            <Covince />
          </AppContainer>
        </Suspense>
      </QueryClientProvider>
    </>
  )
}

export default App
