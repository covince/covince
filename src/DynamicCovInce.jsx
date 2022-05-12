import React, { lazy, memo } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'

import MobileLineageTree from './components/MobileLineageTree'
import Dialog from './components/Dialog'

import { useMobile } from './hooks/useMediaQuery'
import useDynamicAPI from './hooks/useDynamicAPI'
import useDynamicComponents from './hooks/useDynamicComponents'
import useDynamicConfig from './hooks/useDynamicConfig'
import { useInfoQuery, InfoContext } from './hooks/useDynamicInfo'
import useDynamicLineages from './hooks/useDynamicLineages'
import useLineageTree from './hooks/useLineageTree'
import useQueryAsState from './hooks/useQueryAsState'

import { setAliases } from './pango'

const UI = memo(lazy(() => import('./components/UI')))

const DynamicUI = ({
  // aliases_url = 'https://raw.githubusercontent.com/cov-lineages/pango-designation/master/pango_designation/alias_key.json',
  aliases_url = './alias_key.json',
  api_url = './api',
  tiles_url = './tiles/Local_Authority_Districts__December_2019__Boundaries_UK_BUC.json',
  config_url = './data/config.json',
  confidence,
  avg,
  smoothing,
  useAPIImpl = useDynamicAPI,
  ...props
}) => {
  const { darkMode } = props

  const getAliases = async () => {
    const response = await fetch(aliases_url)
    const aliases = await response.json()
    setAliases(aliases)
  }
  useQuery('aliases', getAliases, { suspense: true })

  const getTiles = async () => {
    const response = await fetch(tiles_url)
    return response.json()
  }
  const { data: tiles } = useQuery('tiles', getTiles, { suspense: true })

  const info = useInfoQuery(api_url)

  const fetchConfig = async () => {
    const response = await fetch(config_url)
    return response.json()
  }
  const { data: staticConfig } = useQuery('config', fetchConfig, { suspense: true })

  const isMobile = useMobile()

  const {
    colourPalette,
    lineages,
    lineageToColourIndex,
    nextColourIndex,
    submit
  } = useDynamicLineages(staticConfig)

  const api = useAPIImpl({ api_url, lineages, info, confidence, avg, smoothing })

  const config = useDynamicConfig({ colourPalette, lineages, lineageToColourIndex, staticConfig })

  const [{ lineageView, lineageFilter, area, xMin, xMax }, updateQuery] = useQueryAsState({ lineageView: null, lineageFilter: 'all' })

  const setLineageView = React.useCallback((bool, method) => updateQuery({ lineageView: bool ? '1' : undefined }, method), [])
  const setLineageFilter = React.useCallback(preset => updateQuery({ lineageFilter: preset === 'all' ? undefined : preset }), [])

  const showLineageView = React.useMemo(() => !!lineageView, [lineageView])
  const mutationMode = React.useMemo(() => config.dynamic_mode.mutations, [config])

  const queryParams = React.useMemo(() => ({
    area,
    fromDate: xMin,
    toDate: xMax
  }), [area, xMin, xMax])

  const lineageTree = useLineageTree({
    api_url,
    colourPalette,
    lineageToColourIndex,
    mutationMode,
    preset: lineageFilter,
    queryParams,
    setPreset: setLineageFilter,
    showLineageView
  })

  const injection = useDynamicComponents({
    api_url,
    darkMode,
    info,
    isMobile,
    lineages,
    lineageToColourIndex,
    lineageTree,
    lineageView,
    nextColourIndex,
    queryParams,
    setLineageView,
    submit
  })

  return (
    <InfoContext.Provider value={info}>
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
        <Dialog isOpen={!!lineageView} onClose={() => {}}>
          <div className='fixed inset-0 flex flex-col bg-white dark:bg-gray-700 pt-3'>
            { lineageView &&
              <MobileLineageTree
                api_url={api_url}
                darkMode={darkMode}
                info={info}
                initialValues={lineageToColourIndex}
                lineageTree={lineageTree}
                onClose={values => {
                  if (values !== lineageToColourIndex) {
                    submit(values, { lineageView: undefined })
                  } else {
                    setLineageView(false)
                  }
                }}
                queryParams={queryParams}
              /> }
          </div>
        </Dialog> }
    </InfoContext.Provider>
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
