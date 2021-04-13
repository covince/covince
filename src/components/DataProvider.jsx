import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Spinner from './Spinner'
import geojson from '../assets/Local_Authority_Districts__December_2019__Boundaries_UK_BUC.json'
geojson.features.reverse()

const DataProvider =
  ({ children, default_data_url }) => {
    const [data, setData] = useState(null)

    useEffect(() => {
      if (data === null) {
        axios.get(default_data_url)
          .then(res => {
            setData(res.data)
          })
      }
    }, [data])
    if (data === null) {
      return (<Spinner className='w-6 h-6 text-gray-500' />)
    }

    return (
      React.cloneElement(children, { data: data, tiles: geojson })
    )
  }
export default DataProvider
