import { useEffect, useMemo, useReducer } from 'react'
import axios from 'axios'

import useQueryAsState from './useQueryAsState'

const getDefaultScale = (x) => {
  if (x === 'p') return 'linear'
  if (x === 'lambda') return 'quadratic'
  if (x === 'R') return undefined
}

const useLineages = (dataPath) => {
  const [{ lineage, colorBy, scale }, updateQuery] = useQueryAsState({ lineage: 'B.1.1.7', colorBy: 'p' })
  const [{ current, status, data }, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'LOADING':
        return {
          ...state,
          status: 'LOADING',
          loading: {
            lineage: action.payload.lineage,
            colorBy: action.payload.colorBy
          }
        }
      case 'FETCHED': {
        if (
          state.loading.lineage !== action.payload.lineage ||
          state.loading.colorBy !== action.payload.colorBy
        ) {
          return state
        }
        return {
          ...state,
          status: 'READY',
          loading: {
            lineage: null,
            colorBy: null
          },
          current: {
            lineage: action.payload.lineage,
            colorBy: action.payload.colorBy
          },
          data: action.payload.data
        }
      }
    }
  }, {
    status: 'INIT',
    current: { lineage: null, colorBy: null },
    loading: { lineage: null, colorBy: null },
    data: null
  })

  useEffect(() => {
    dispatch({ type: 'LOADING', payload: { lineage, colorBy } })
    axios.get(`${dataPath}/lineage/${lineage}/${colorBy}.json`)
      .then(res => {
        dispatch({ type: 'FETCHED', payload: { data: res.data, lineage, colorBy } })
      })
  }, [lineage, colorBy])

  const actions = {
    setLineage: lineage => updateQuery({ lineage }),
    colorBy: colorBy => updateQuery({ colorBy, scale: undefined }),
    setScale: scale => updateQuery({ scale })
  }

  const results = useMemo(() => {
    if (data === null) {
      return null
    }

    const { dates, areas, values } = data

    let max = 0
    for (const row of values) {
      max = Math.max(max, ...row)
    }
    if (current.colorBy === 'p') max *= 100
    if (current.colorBy === 'R') max = 4
    if (current.colorBy === 'lambda') max = Math.min(max, 1000)

    const index = {}

    for (let i = 0; i < areas.length; i++) {
      const area = areas[i]
      const lookup = {}
      for (let j = 0; j < dates.length; j++) {
        const value = values[i][j]
        lookup[dates[j]] = current.colorBy === 'p' ? value * 100 : value
      }
      index[area] = lookup
    }

    return { min: 0, max, index, dates }
  }, [data])

  const state = useMemo(() => {
    return {
      status,
      ...current,
      scale: scale || getDefaultScale(current.colorBy),
      loading: {
        lineage,
        colorBy
      }
    }
  }, [current, status, lineage, colorBy, scale])

  return [state, actions, results]
}

export default useLineages
