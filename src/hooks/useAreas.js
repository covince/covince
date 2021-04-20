import { useEffect, useReducer } from 'react'
import axios from 'axios'
import useQueryAsState from './useQueryAsState'

const useAreas = (dataPath) => {
  const [{ lad }, updateQuery] = useQueryAsState({ lad: 'national' })
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'LOADING':
        return {
          ...state,
          loadingLad: action.payload,
          status: 'LOADING'
        }
      case 'FETCHED': {
        if (action.payload.lad !== state.loadingLad) return state
        return {
          ...state,
          status: 'READY',
          loadingLad: null,
          currentArea: action.payload.lad,
          data: action.payload.data.map(x => {
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
        }
      }
    }
  }, { status: 'INIT' })

  useEffect(() => {
    dispatch({ type: 'LOADING', payload: lad })
    axios.get(`${dataPath}/area/${lad}.json`)
      .then(res => {
        dispatch({ type: 'FETCHED', payload: { lad, data: res.data.data } })
      })
  }, [lad])

  const actions = {
    load: (lad) => updateQuery({ lad })
  }

  return [state, actions]
}

export default useAreas
