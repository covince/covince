import { useEffect, useMemo, useReducer } from 'react'

import useQueryAsState from './useQueryAsState'

const getDefaultScale = (default_color_scale, x) => {
  if (typeof default_color_scale === 'string') {
    return default_color_scale
  }
  if (typeof default_color_scale === 'object') {
    return default_color_scale[x] || 'linear'
  }
  return 'linear'
}

const useLineages = (api, options, lineages) => {
  const [{ lineage, colorBy, scale, lineageView }, updateQuery] = useQueryAsState({
    lineage: options.default_lineage || lineages[0],
    colorBy: options.default_color_by
  })
  const [{ current, status, data }, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'QUEUE_REFETCH':
        return {
          ...state,
          status: 'QUEUED'
        }
      case 'LOADING':
        return {
          ...state,
          status: 'LOADING',
          loading: action.payload.props
        }
      case 'FETCHED': {
        const { props, data } = action.payload
        if (Object.entries(state.loading).some(([k, v]) => props[k] !== v)) {
          return state
        }
        return {
          ...state,
          status: 'READY',
          loading: null,
          current: action.payload.props,
          data
        }
      }
      case 'ERROR': {
        throw action.payload
      }
    }
  }, {
    status: 'QUEUED',
    current: { lineage: lineageView ? '' : null, colorBy: null, lineagesKey: null },
    loading: null,
    data: null
  })

  const lineagesKey = useMemo(() => lineages.sort().join(','), [lineages])

  useEffect(() => {
    if (
      !lineageView &&
      status === 'READY' && (
        current.lineage !== lineage ||
        current.colorBy !== colorBy ||
        current.lineagesKey !== lineagesKey
      )) {
      dispatch({ type: 'QUEUE_REFETCH' })
    }
  }, [lineageView])

  useEffect(() => { dispatch({ type: 'QUEUE_REFETCH' }) }, [lineage, colorBy, lineagesKey])

  useEffect(async () => {
    if (lineageView || status !== 'QUEUED') {
      return
    }
    if (lineages.length && !lineages.includes(lineage)) {
      updateQuery({ lineage: lineages[0] })
      return
    }
    dispatch({ type: 'LOADING', payload: { props: { lineage, colorBy, lineagesKey } } })
    try {
      const data = await api.fetchMapData(lineage, colorBy)
      dispatch({ type: 'FETCHED', payload: { data, props: { lineage, colorBy, lineagesKey } } })
    } catch (e) {
      dispatch({ type: 'ERROR', payload: e })
    }
  }, [lineageView, status])

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
