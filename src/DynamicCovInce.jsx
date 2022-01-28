import React, { lazy, memo } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'

import MobileLineageTree from './components/MobileLineageTree'
import Dialog from './components/Dialog'

import { useMobile } from './hooks/useMediaQuery'
import useQueryAsState from './hooks/useQueryAsState'
import useDynamicLineages from './hooks/useDynamicLineages'
import useDynamicAPI from './hooks/useDynamicAPI'
import useDynamicConfig from './hooks/useDynamicConfig'
import useDynamicComponents from './hooks/useDynamicComponents'
import useLineageTree from './hooks/useLineageTree'

const UI = memo(lazy(() => import('./components/UI')))

const DynamicUI = ({
  api_url = './api',
  tiles_url = './tiles/Local_Authority_Districts__December_2019__Boundaries_UK_BUC.json',
  config_url = './data/config.json',
  confidence,
  avg,
  useAPIImpl = useDynamicAPI,
  ...props
}) => {
  const { darkMode } = props

  const getTiles = async () => {
    const response = await fetch(tiles_url)
    return response.json()
  }
  const { data: tiles } = useQuery('tiles', getTiles, { suspense: true })

  const getInfo = async () => {
    const response = await fetch(`${api_url}/info`)
    const info = await response.json()
    info.dates.sort()
    return info
  }
  const { data: info } = useQuery('info', getInfo, { suspense: true })

  const fetchConfig = async () => {
    const response = await fetch(config_url)
    return response.json()
  }
  const { data: staticConfig } = useQuery('config', fetchConfig, { suspense: true })

  const isMobile = useMobile()

  const { colourPalette, lineages, lineageToColourIndex, submit } = useDynamicLineages(staticConfig)
  const api = useAPIImpl({ api_url, lineages, info, confidence, avg })

  const [{ lineageView, area, xMin, xMax }, updateQuery] = useQueryAsState({ lineageView: '0' })
  const showLineageView = React.useMemo(() => lineageView === '1', [lineageView])
  const setLineageView = React.useCallback((bool, method) => updateQuery({ lineageView: bool ? '1' : undefined }, method), [])

  const lineageTree = useLineageTree({
    api_url,
    area,
    colourPalette,
    // compat with desktop links
    fromDate: xMin,
    toDate: xMax,
    lineageToColourIndex,
    showLineageView
  })

  const injection = useDynamicComponents({
    darkMode,
    info,
    isMobile,
    lineages,
    lineageToColourIndex,
    lineageTree,
    setLineageView,
    showLineageView,
    submit
  })

  const config = useDynamicConfig({ colourPalette, lineages, lineageToColourIndex, staticConfig })

  return (
    <>
      <UI
        {...props}
        api={api}
        config={config}
        injection={injection}
        lastModified={info.lastModified}
        lineages={lineages}
        tiles={tiles}
      />
      { isMobile &&
        <Dialog isOpen={showLineageView} onClose={() => {}}>
            <div className='fixed inset-0 flex flex-col bg-white dark:bg-gray-700 pt-3 pl-3'>
              { showLineageView &&
                <MobileLineageTree
                  darkMode={darkMode}
                  onClose={values => {
                    if (values !== lineageToColourIndex) {
                      submit(values, { lineageView: undefined })
                    } else {
                      setLineageView(false)
                    }
                  }}
                  initialValues={lineageToColourIndex}
                  maxLineages={info.maxLineages}
                  {...lineageTree}
                /> }
            </div>
        </Dialog> }
    </>
  )
}

const twentyFourHoursInMs = 1000 * 60 * 60 * 24

const DynamicCovInce = props => {
  const queryClient = React.useRef(new QueryClient({
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
      <DynamicUI {...props} />
    </QueryClientProvider>
  )
}

export default DynamicCovInce
