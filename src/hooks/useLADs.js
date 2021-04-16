import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import useQueryAsState from './useQueryAsState'

const useLAD = (dataPath) => {
  const [{ lad }, updateQuery] = useQueryAsState({ lad: 'United Kingdom' })
  const [{ currentLad = null, data }, storeResult] = useState({})

  useEffect(() => {
    axios.get(`${dataPath}/ltla/${lad}.json`)
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
        }).filter(x => x.mean >= 0)

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
