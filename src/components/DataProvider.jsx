import React from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'
import useQueryAsState from '../hooks/useQueryAsState'
import { setConfig } from '../config'

const DataProvider = (props) => {
  const {
    children,
    default_data_url,
    default_tiles_url,
    default_config_url,
    trustedOrigins
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
          }
        } catch (e) {}
      }
      return urls
    }
    return query
  }, [trustedOrigins, query.geojson, query.dataPath, query.configUrl])

  const getData = async () => {
    const { data, headers } = await axios.get(`${dataPath}/lists.json`)
    return [data, headers['last-modified']]
  }
  const getTiles = async () => {
    const { data } = await axios.get(geojson)
    return data
  }
  const getConfig = async () => {
    const { data } = await axios.get(configUrl)
    return data
  }

  const { data: lists } = useQuery('data', getData, { suspense: true })
  const [data, lastModified] = lists || []

  const { data: tiles } = useQuery('tiles', getTiles, { suspense: true })

  const { data: config } = useQuery('config', getConfig, { suspense: true })

  setConfig(config)

  return (
    React.cloneElement(children, { data, tiles, dataPath, lastModified })
  )
}
export default DataProvider
