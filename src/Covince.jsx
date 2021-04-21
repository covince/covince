import React, { lazy } from 'react'

import DataProvider from './components/DataProvider'

const UI = lazy(() => import('./components/UI'))

const Covince = ({
  default_data_url = './data',
  default_tiles_url = './tiles/Local_Authority_Districts__December_2019__Boundaries_UK_BUC.json',
  ...props
}) => (
  <DataProvider
    default_data_url={default_data_url}
    default_tiles_url={default_tiles_url}
  >
    <UI {...props} />
  </DataProvider>
)

export default Covince
