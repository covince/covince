import React, { Suspense } from 'react'

import NavBar from './components/NavBar'
import Spinner from './components/Spinner'
import AppContainer from './components/AppContainer'
import Select from './components/Select'
// import CovInce from './Covince'
import CovInce from './DynamicCovInce'

import useDarkMode from './hooks/useDarkMode'

const Loading = () => (
  <div className='fixed inset-0 grid place-content-center'>
    <Spinner className='w-6 h-6 text-gray-500 dark:text-gray-300' />
  </div>
)

function App () {
  const { isDark, mode, setMode } = useDarkMode()
  return (
    <>
      <Suspense fallback={<Loading />}>
        <NavBar>
          <label className='text-sm flex items-center space-x-3'>
            <span className='font-bold'>Theme:</span>
            <Select
              className='text-white text-sm rounded-md !bg-blue-800 dark:bg-blue-800 !border-primary'
              chevronClass='text-white'
              value={mode}
              onChange={e => setMode(e.target.value)}
            >
              <option>system</option>
              <option>light</option>
              <option>dark</option>
            </Select>
          </label>
        </NavBar>
        <AppContainer>
          <CovInce
            darkMode={isDark}
          />
        </AppContainer>
      </Suspense>
    </>
  )
}

export default App
