import React from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'
import useQueryAsState from '../hooks/useQueryAsState'
import { setConfig } from '../config'

const DataProvider = ({ children, default_data_url, default_tiles_url, disableQueryParams }) => {
  const [{ geojson, dataPath }] =
    disableQueryParams
      ? [{ geojson: default_tiles_url, dataPath: default_data_url }]
      : useQueryAsState({
        geojson: default_tiles_url,
        dataPath: default_data_url
      })

  const getData = async () => {
    const { data, headers } = await axios.get(`${dataPath}/lists.json`)
    return [data, headers['last-modified']]
  }
  const getTiles = async () => {
    const { data } = await axios.get(geojson)
    return data
  }
  const getConfig = async () => {
    const { data } = await axios.get(`${dataPath}/config.json`)
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
