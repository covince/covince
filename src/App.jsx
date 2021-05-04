import React, { Suspense, useState, useMemo } from 'react'

import NavBar from './components/NavBar'
import Spinner from './components/Spinner'
import AppContainer from './components/AppContainer'
import Covince from './Covince'
import { format } from 'date-fns'

const Loading = () => (
  <div className='fixed inset-0 grid place-content-center'>
    <Spinner className='w-6 h-6 text-gray-500' />
  </div>
)

function App () {
  const [info, setInfo] = useState(null)
  const formattedVersion = useMemo(() => {
    if (info) return format(new Date(info.lastModified), 'dd MMMM yyy, HH:mm')
    return null
  }, [info])

  return (
    <>
      <Suspense fallback={<Loading />}>
        <NavBar>
          { formattedVersion &&
            <p className='text-sm text-right'>
              Data updated <strong className='block'>{formattedVersion}</strong>
            </p> }
        </NavBar>
        <AppContainer>
          <Covince onLoad={setInfo} />
        </AppContainer>
      </Suspense>
    </>
  )
}

export default App
