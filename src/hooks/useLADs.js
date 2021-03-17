import { useEffect, useReducer } from 'react'
import axios from 'axios'

const useLAD = () => {
  const [state, dispatch] = useReducer((state, { type, payload }) => {
    if (state.status === 'LOADING') {
      switch (type) {
        case 'DATA':
          return {
            ...state,
            status: 'READY',
            loadingLad: null,
            currentLad: state.loadingLad,
            data: payload
          }
        default:
          return state
      }
    }
    switch (type) {
      case 'LOAD':
        return {
          ...state,
          status: 'LOADING',
          loadingLad: payload
        }
      default:
        return state
    }
  }, {
    status: 'LOADING',
    loadingLad: 'E08000006',
    currentLad: null,
    data: null
  })

  useEffect(() => {
    if (state.loadingLad === null) {
      return
    }
    axios.get(`./data/ltla/${state.loadingLad}.json`)
      .then(res => {
        const new_data = res.data.data.map(x => {
          x.range = [x.lower, x.upper]
          return (x)
        })
        dispatch({ type: 'DATA', payload: new_data })
      })
  }, [state.loadingLad])

  const actions = {
    load: (lad) => dispatch({ type: 'LOAD', payload: lad })
  }

  return [state, actions]
}

export default useLAD
