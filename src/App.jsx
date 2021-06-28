import React, { Suspense } from 'react'

import NavBar from './components/NavBar'
import Spinner from './components/Spinner'
import AppContainer from './components/AppContainer'
import CovInce from './Covince'

import useDarkMode from './hooks/useDarkMode'

const Loading = () => (
  <div className='fixed inset-0 grid place-content-center'>
    <Spinner className='w-6 h-6 text-gray-500' />
  </div>
)

function App () {
  const { isDark } = useDarkMode()
  return (
    <>
      <Suspense fallback={<Loading />}>
        <NavBar />
        <AppContainer>
          <CovInce darkMode={isDark} />
        </AppContainer>
      </Suspense>
    </>
  )
}

export default App
