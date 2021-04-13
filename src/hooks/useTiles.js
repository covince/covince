import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'

// import { features } from '../assets/hex.json'

function useTiles () {
  const [tiles, setTiles] = useState(null)

  useEffect(() => {
    axios.get('./tiles/Local_Authority_Districts__December_2019__Boundaries_UK_BUC.json')
      .then(res => {
        res.data.features.reverse() // Hack to get Z order with England last
        setTiles(res.data)
      })
  }, [])

  return tiles
}

export default useTiles
