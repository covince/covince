import { useEffect, useMemo, useReducer } from 'react'
import axios from 'axios'

import useQueryAsState from './useQueryAsState'

const getDefaultScale = (default_color_scale, x) => {
  if (typeof default_color_scale === 'string') {
    return default_color_scale
  }
  if (typeof default_color_scale === 'object') {
    return default_color_scale[x]
  }
  return 'linear'
}

const useLineages = (dataPath, options, lineages) => {
  const [{ lineage, colorBy, scale }, updateQuery] = useQueryAsState({ lineage: options.default_lineage || lineages[0], colorBy: options.default_color_by })
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
    const mean = Array.isArray(values) ? values : values.mean
    let max = 0
    for (let i = 0; i < areas.length; i++) {
      if (areas[i] === 'overview') continue
      max = Math.max(max, ...mean[i])
    }
    // TODO: generalise/remove this
    if (current.colorBy === 'p') max *= 100
    if (current.colorBy === 'R') max = 4
    if (current.colorBy === 'lambda') max = Math.min(max, 1000)

    const areaLookups = []

    for (let i = 0; i < areas.length; i++) {
      const area = areas[i]
      const lookup = {}
      for (let j = 0; j < dates.length; j++) {
        const value = mean[i][j]
        lookup[dates[j]] = {
          mean: current.colorBy === 'p' && value !== null ? value * 100 : value,
          upper: values.upper ? values.upper[i][j] : null,
          lower: values.lower ? values.lower[i][j] : null
        }
      }
      console.log(lookup)
      areaLookups.push({ area, lookup })
    }

    return { min: 0, max, values: areaLookups, dates }
  }, [data])

  const state = useMemo(() => {
    return {
      status,
      ...current,
      scale: scale || getDefaultScale(options.default_color_scale, current.colorBy),
      loading: {
        lineage,
        colorBy
      }
    }
  }, [current, status, lineage, colorBy, scale])

  return [state, actions, results]
}

export default useLineages
