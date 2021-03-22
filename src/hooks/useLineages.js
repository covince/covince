import { useEffect, useReducer, useMemo } from 'react'
import axios from 'axios'

const setScale = (x) => {
  if (x === 'p') return 'linear'
  if (x === 'lambda') return 'quadratic'
  if (x === 'R') return 'linear'
}

const useLineages = () => {
  const [state, dispatch] = useReducer((state, { type, payload }) => {
    if (state.status === 'LOADING') {
      switch (type) {
        case 'DATA': {
          return {
            ...state,
            status: 'READY',
            data: payload,
            loading: {},
            ...state.loading,
            scale: state.parameter !== state.loading.parameter
              ? setScale(state.loading.parameter)
              : state.scale
          }
        }
        default:
          return state
      }
    }
    switch (type) {
      case 'LINEAGE': {
        return {
          ...state,
          status: 'LOADING',
          loading: {
            lineage: payload,
            parameter: state.parameter
          }
        }
      }
      case 'COLOR_BY':
        return {
          ...state,
          status: 'LOADING',
          loading: {
            lineage: state.lineage,
            parameter: payload
          }
        }
      case 'SCALE':
        return {
          ...state,
          scale: payload
        }
      default:
        return state
    }
  }, {
    status: 'LOADING',
    loading: {
      lineage: 'B.1.1.7',
      parameter: 'p'
    },
    lineage: null,
    parameter: null,
    scale: null,
    data: null
  })

  useEffect(() => {
    if (state.status === 'LOADING') {
      const { lineage, parameter } = state.loading
      axios.get(`./data/lineage/${lineage}/${parameter}.json`)
        .then(res => {
          dispatch({ type: 'DATA', payload: res.data })
        })
    }
  }, [state.status])

  const actions = {
    setLineage: lineage => dispatch({ type: 'LINEAGE', payload: lineage }),
    colorBy: param => dispatch({ type: 'COLOR_BY', payload: param }),
    setScale: scale => dispatch({ type: 'SCALE', payload: scale })
  }

  const results = useMemo(() => {
    if (state.data === null) {
      return null
    }

    const { dates, ltlas, values } = state.data

    let max = 0
    for (const row of values) {
      max = Math.max(max, ...row)
    }
    if (state.parameter === 'p') max *= 100
    if (state.parameter === 'R') max = 4
    if (state.parameter === 'lambda') max = Math.min(max, 1000)

    const index = {}

    for (let i = 0; i < ltlas.length; i++) {
      const ltla = ltlas[i]
      const lookup = {}
      for (let j = 0; j < dates.length; j++) {
        const value = values[i][j]
        lookup[dates[j]] = state.parameter === 'p' ? value * 100 : value
      }
      index[ltla] = lookup
    }

    return { min: 0, max, index, dates }
  }, [state.data])

  return [state, actions, results]
}

export default useLineages
