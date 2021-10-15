import React, { lazy, useRef } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import DataProvider from './components/DataProvider'

// allows DataProvider to make requests while UI loads
const UI = lazy(() => import('./components/UI'))

const twentyFourHoursInMs = 1000 * 60 * 60 * 24

const CovInce = ({
  data_url = './data',
  tiles_url = './tiles/Local_Authority_Districts__December_2019__Boundaries_UK_BUC.json',
  config_url = `${data_url}/config.json`,
  trustedQueryParamOrigins,
  api,
  ...props
}) => {
  const queryClient = useRef(new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnmount: false,
        refetchOnReconnect: false,
        staleTime: twentyFourHoursInMs * 100
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient.current}>
      <DataProvider
        default_data_url={data_url}
        default_tiles_url={tiles_url}
        default_config_url={config_url}
        trustedOrigins={trustedQueryParamOrigins}
        apiImpl={api}
      >
        <UI {...props} />
      </DataProvider>
    </QueryClientProvider>
  )
}

export default CovInce
