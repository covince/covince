import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'

// import { features } from '../assets/hex.json'

function useLists () {
  const [lists, setLists] = useState(null)

  useEffect(() => {
    axios.get('./data/lists.json')
      .then(res => {
        setLists(res.data)
      })
  }, [])

  return lists
}

export default useLists
