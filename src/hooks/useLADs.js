import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import useQueryAsState from './useQueryAsState'

const useLAD = () => {
  const [{ lad }, updateQuery] = useQueryAsState({ lad: 'national' })
  const [{ currentLad, data }, storeResult] = useState({})

  useEffect(() => {
    axios.get(`./data/ltla/${lad}.json`)
      .then(res => {
        const new_data = res.data.data.map(x => {
          if (x.parameter === 'p') {
            return {
              ...x,
              mean: x.mean * 100,
              range: [x.lower * 100, x.upper * 100]
            }
          }
          return {
            ...x,
            range: [x.lower, x.upper]
          }
        })
        storeResult({ currentLad: lad, data: new_data })
      })
  }, [lad])

  const actions = {
    load: (lad) => updateQuery({ lad })
  }

  const state = useMemo(() => ({
    status: lad === currentLad ? 'READY' : 'LOADING',
    loadingLad: lad,
    currentLad,
    data
  }))

  return [state, actions]
}

export default useLAD
