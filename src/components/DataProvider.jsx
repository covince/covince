import React from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'
import useQueryAsState from '../hooks/useQueryAsState'

// https://personal.sron.nl/~pault/
const tolMutedQualitative = [
  '#332288', // indigo
  '#88CCEE', // cyan
  '#44AA99', // teal
  '#117733', // green
  '#999933', // olive
  '#DDCC77', // sand
  '#CC6677', // rose
  '#882255', // wine
  '#AA4499', // purple
  '#DDDDDD' // grey
]

const DataProvider = ({ children, default_data_url, default_tiles_url }) => {
  const [{ geojson, dataPath }, updateQuery] = useQueryAsState({
    geojson: default_tiles_url,
    dataPath: default_data_url
  })

  const getData = async () => {
    const { data } = await axios.get(`${dataPath}/lists.json`)
    if (data.colors === undefined) {
      data.colors = tolMutedQualitative
    }
    if (data.frameLength === undefined) {
      data.frameLength = 100
    }
    return data
  }
  const getTiles = async () => {
    const { data } = await axios.get(geojson)
    data.features.reverse()
    return data
  }

  const { data } = useQuery('data', getData, { suspense: true })

  const { data: tiles } = useQuery('tiles', getTiles, { suspense: true })

  return (
    React.cloneElement(children, { data: data, tiles: tiles, dataPath: dataPath })
  )
}
export default DataProvider
