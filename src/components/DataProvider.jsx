import React from 'react'
import { useQuery } from 'react-query'
import useQueryAsState from '../hooks/useQueryAsState'

import { setConfig } from '../config'
import useAPI from '../api'

const DataProvider = (props) => {
  const {
    children,
    default_data_url,
    default_tiles_url,
    default_config_url,
    trustedOrigins,
    apiImpl
  } = props

  const defaultUrls = {
    geojson: default_tiles_url,
    dataPath: default_data_url,
    configUrl: default_config_url
  }

  const [query] = useQueryAsState(defaultUrls)

  const { geojson, dataPath, configUrl } = React.useMemo(() => {
    if (Array.isArray(trustedOrigins)) {
      const urls = { ...defaultUrls }
      for (const key of Object.keys(urls)) {
        const value = query[key]
        try {
          const parsedUrl = new URL(value, document.baseURI)
          if (trustedOrigins.some(origin => origin === parsedUrl.origin)) {
            urls[key] = value
          } else {
            console.log('[CovInce]', parsedUrl.origin, 'is not a trusted origin, ignoring.')
          }
        } catch (e) {}
      }
      return urls
    }
    return query
  }, [trustedOrigins, query.geojson, query.dataPath, query.configUrl])

  const api = useAPI({ dataPath, ...apiImpl })

  const getData = async () => {
    return api.fetchLists()
  }
  const getTiles = async () => {
    const response = await fetch(geojson)
    return response.json()
  }
  const getConfig = async () => {
    const response = await fetch(configUrl)
    return response.json()
  }

  const { data: lists } = useQuery('data', getData, { suspense: true })
  const { data, lastModified } = lists || {}

  const { data: tiles } = useQuery('tiles', getTiles, { suspense: true })

  const { data: config } = useQuery('config', getConfig, { suspense: true })

  setConfig(config)

  return (
    React.cloneElement(children, { data, tiles, lastModified, api })
  )
}
export default DataProvider
