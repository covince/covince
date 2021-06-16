import { useEffect, useReducer } from 'react'
import axios from 'axios'
import useQueryAsState from './useQueryAsState'

const useAreas = (dataPath) => {
  const [{ area }, updateQuery] = useQueryAsState({ area: 'overview' })
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'LOADING':
        return {
          ...state,
          loadingArea: action.payload,
          status: 'LOADING'
        }
      case 'FETCHED': {
        if (action.payload.area !== state.loadingArea) return state
        return {
          ...state,
          status: 'READY',
          loadingArea: null,
          currentArea: action.payload.area,
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
    dispatch({ type: 'LOADING', payload: area })
    axios.get(`${dataPath}/area/${area}.json`)
      .then(res => {
        dispatch({ type: 'FETCHED', payload: { area, data: res.data.data } })
      })
  }, [area])

  const actions = {
    load: (area) => updateQuery({ area })
  }

  return [state, actions]
}

export default useAreas
