import React, { lazy, Suspense } from 'react'
import NavBar from './components/NavBar'
import Spinner from './components/Spinner'
import AppContainer from './components/AppContainer'
import DataProvider from './components/DataProvider'
import { QueryClient, QueryClientProvider } from 'react-query'

const twentyFourHoursInMs = 1000 * 60 * 60 * 24
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnmount: false,
      refetchOnReconnect: false,
      staleTime: twentyFourHoursInMs*100
    }
  }
})

const Covid19 = lazy(() => import('./components/Covid19'))

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
            <DataProvider
              default_data_url="./data"
              default_tiles_url='./tiles/Local_Authority_Districts__December_2019__Boundaries_UK_BUC.json'
            >
              <Covid19 />
            </DataProvider>
          </AppContainer>
        </Suspense>
      </QueryClientProvider>
    </>
  )
}

export default App
