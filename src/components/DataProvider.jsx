import React from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'

const DataProvider =
  ({ children, default_data_url, default_tiles_url }) => {
    const getData = async () => {
      const { data } = await axios.get(default_data_url)
      if (data.colors === undefined) {
        data.colors = ['red', 'green', 'blue', 'orange', 'pink', 'aqua', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']
      }
      return data
    }
    const getTiles = async () => {
      const { data } = await axios.get(default_tiles_url)
      data.features.reverse()
      return data
    }

    const { data } = useQuery('data', getData, { suspense: true })

    const { data: tiles } = useQuery('tiles', getTiles, { suspense: true })

    return (
      React.cloneElement(children, { data: data, tiles: tiles })
    )
  }
export default DataProvider
