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

  const lineagesKey = useMemo(() => [...lineages].sort().join(','), [lineages])

  const [{ current, status, queued, data }, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'QUEUE_REFETCH':
        return {
          ...state,
          status: 'QUEUED',
          queued: action.payload.props
        }
      case 'LOADING':
        return {
          ...state,
          status: 'LOADING',
          queued: null,
          loading: state.queued
        }
      case 'FETCHED': {
        const { props, data } = action.payload
        if (props !== state.loading) {
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
    status: 'INIT',
    queued: null,
    loading: null,
    current: { lineage: null, colorBy: null, lineagesKey: null },
    data: null
  })

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

  useEffect(() => { dispatch({ type: 'QUEUE_REFETCH', payload: { props: { lineage, colorBy, lineagesKey } } }) }, [lineage, colorBy, lineagesKey])

  useEffect(async () => {
    // does not skip on initial load
    if ((current.lineage !== null && lineageView) || status !== 'QUEUED') {
      return
    }
    const { lineage, colorBy } = queued
    if (lineages.length && !lineages.includes(lineage)) {
      updateQuery({ lineage: lineages[0] })
      return
    }
    dispatch({ type: 'LOADING' })
    try {
      const data = await api.fetchMapData(lineage, colorBy)
      dispatch({ type: 'FETCHED', payload: { data, props: queued } })
    } catch (e) {
      dispatch({ type: 'ERROR', payload: e })
    }
  }, [lineageView, queued])

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
