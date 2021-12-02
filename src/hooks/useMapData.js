import { useEffect, useMemo, useReducer } from 'react'

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

const useLineages = (api, options, lineages) => {
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
      case 'ERROR': {
        throw action.payload
      }
    }
  }, {
    status: 'INIT',
    current: { lineage: null, colorBy: null },
    loading: { lineage: null, colorBy: null },
    data: null
  })

  useEffect(async () => {
    if (lineage && colorBy) {
      dispatch({ type: 'LOADING', payload: { lineage, colorBy } })
      try {
        const data = await api.fetchMapData(lineage, colorBy)
        dispatch({ type: 'FETCHED', payload: { data, lineage, colorBy } })
      } catch (e) {
        dispatch({ type: 'ERROR', payload: e })
      }
    }
  }, [lineage, colorBy, lineages])

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

    let min = Number.MAX_SAFE_INTEGER
    let max = Number.MIN_SAFE_INTEGER
    for (let i = 0; i < areas.length; i++) {
      if (areas[i] === 'overview') continue
      min = Math.min(min, ...mean[i])
      max = Math.max(max, ...mean[i])
    }
    if (options.color_map_domain) {
      const domain = options.color_map_domain[colorBy]
      if (domain) {
        min = domain.min || min
        max = domain.max || max
      }
    } else {
      // back compat
      min = 0
    }

    const areaLookups = []

    for (let i = 0; i < areas.length; i++) {
      const area = areas[i]
      const lookup = {}
      for (let j = 0; j < dates.length; j++) {
        const value = mean[i][j]
        const upper = values.upper ? values.upper[i][j] : null
        const lower = values.lower ? values.lower[i][j] : null
        lookup[dates[j]] = {
          mean: value,
          upper: upper,
          lower: lower
        }
      }
      areaLookups.push({ area, lookup })
    }

    return { min, max, values: areaLookups, dates }
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
