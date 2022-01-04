import { useEffect, useReducer } from 'react'
import useQueryAsState from './useQueryAsState'

const useChartData = (api, lineages) => {
  const [{ area }, updateQuery] = useQueryAsState({ area: 'overview' })
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'LOADING':
        return {
          ...state,
          loading: action.payload,
          status: 'LOADING'
        }
      case 'FETCHED': {
        if (action.payload.area !== state.loading.area ||
          action.payload.lineages !== state.loading.lineages) return state
        return {
          ...state,
          status: 'READY',
          loading: null,
          area: action.payload.area,
          lineages: action.payload.lineages,
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
      case 'ERROR': {
        throw action.payload
      }
    }
  }, { status: 'INIT', area: null }) // null denotes initial load

  useEffect(async () => {
    dispatch({ type: 'LOADING', payload: { area, lineages } })
    try {
      const data = await api.fetchChartData(area, lineages)
      dispatch({ type: 'FETCHED', payload: { area, lineages, data } })
    } catch (e) {
      dispatch({ type: 'ERROR', payload: e })
    }
  }, [area, lineages])

  const actions = {
    load: (area) => updateQuery({ area })
  }

  return [state, actions]
}

export default useChartData
