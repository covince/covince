import React, { lazy, Suspense, useState, useEffect } from 'react'
import NavBar from './components/NavBar'
import Spinner from './components/Spinner'
import AppContainer from './components/AppContainer'
import axios from 'axios'

const Covid19 = lazy(() => import('./components/Covid19'))

const Loading = () => (
  <div className='fixed inset-0 grid place-content-center'>
    <Spinner className='w-6 h-6 text-gray-500' />
  </div>
)

function App () {
  const [data, setData] = useState(null)
  const [tiles, setTiles] = useState(null)

  useEffect(() => {
    if (data === null) {
      axios.get('./data/lists.json')
        .then(res => {
          setData(res.data)
        })
    }
  }, [data])

  useEffect(() => {
    if (tiles === null) {
      axios.get('./tiles/Local_Authority_Districts__December_2019__Boundaries_UK_BUC.json')
        .then(res => {
          res.data.features.reverse() // Hack to get Z order with England last
          setTiles(res.data)
        })
    }
  }, [tiles])

  return (
    <>
      <Suspense fallback={<Loading />}>
        {tiles && data
          ? <> <NavBar />
        <AppContainer>

              <Covid19 data={data} tiles={tiles} />

        </AppContainer> </>
          : <Loading />}
      </Suspense>
    </>
  )
}

export default App
