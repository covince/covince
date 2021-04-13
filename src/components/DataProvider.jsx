import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Spinner from './Spinner'

const DataProvider =
  ({ children, default_data_url, default_tiles_url }) => {
    const [data, setData] = useState(null)
    const [tiles, setTiles] = useState(null)

    useEffect(() => {
      if (data === null) {
        axios.get(default_data_url)
          .then(res => {
            setData(res.data)
          })
      }
    }, [data])

    useEffect(() => {
      if (tiles === null) {
        axios.get(default_tiles_url)
          .then(res => {
            res.data.features.reverse() // Hack to get Z order with England last
            setTiles(res.data)
          })
      }
    }, [tiles])

    if (data === null | tiles === null) {
      return (<div>
      <Spinner className='w-6 h-6 text-gray-500' />
    </div>)
    }

    return (
      React.cloneElement(children, { data: data, tiles: tiles })
    )
  }
export default DataProvider
