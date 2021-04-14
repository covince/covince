import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'
import Spinner from './Spinner'

const DataProvider =
  ({ children, default_data_url, default_tiles_url }) => {
    const getData = async () => {
      const { data } = await axios.get(default_data_url)
      return data
    }
    const getTiles = async () => {
      const { data } = await axios.get(default_tiles_url)
      return data
    }

    const { data } = useQuery('data', getData, { suspense: true })

    const { data: tiles } = useQuery('tiles', getTiles, { suspense: true })

    console.log(tiles)

    return (
      React.cloneElement(children, { data: data, tiles: tiles })
    )
  }
export default DataProvider
