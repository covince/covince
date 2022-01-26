import { useReducer, useEffect, useCallback, useMemo } from 'react'

import { buildFullTopology, whoVariants } from '../pango'
import useReverseAliasLookup from './useReverseAliasLookup'

const whoVariantsOrder = Object.keys(whoVariants)

const fetchLineages = async (api_url, { area = '', fromDate = '', toDate = '' } = {}) => {
  const response = await fetch(`${api_url}/lineages?area=${area}&from=${fromDate}&to=${toDate}`)
  return response.json()
}

const sortByCladeSize = (a, b) => {
  if (b.sumOfClade + b.sum > a.sumOfClade + a.sum) return 1
  if (b.sumOfClade + b.sum < a.sumOfClade + a.sum) return -1
  return 0
}

const constructLineage = (name, toAlias) => {
  let remaining = name
  while (remaining.includes('.')) {
    remaining = remaining.slice(0, remaining.lastIndexOf('.'))
    if (remaining in toAlias) {
      return name.replace(remaining, toAlias[remaining])
    }
  }
  return name
}

const createNodeWithState = (node, state, parentWho) => {
  const { nodeIndex, preset, selectedLineages } = state
  const {
    lineage = constructLineage(node.name, state.toAlias),
    sum = 0,
    selected = selectedLineages.includes(lineage)
  } = nodeIndex[node.name] || {}
  const alias = state.toAlias[node.name]
  const who = whoVariants[node.name]

  let childrenWithState = []
  for (const child of node.children) {
    const newNodes = createNodeWithState(child, state, who || parentWho)
    childrenWithState = childrenWithState.concat(newNodes)
  }
  childrenWithState.sort(sortByCladeSize)

  if (preset === 'who' && !(who || parentWho)) {
    return childrenWithState
  }

  let sumOfClade = 0
  let childIsSelected = false
  for (const child of childrenWithState) {
    sumOfClade += child.sumOfClade + child.sum
    childIsSelected = childIsSelected || child.childIsSelected || child.selected
  }

  return [{
    altName: who || alias,
    childIsSelected,
    children: preset === 'selected' && (selected && !childIsSelected) ? [] : childrenWithState,
    lineage,
    name: node.name,
    searchText: [node.name, lineage, who || parentWho, alias].join('|').toLowerCase(),
    selected,
    sum,
    sumOfClade
  }]
}

const mapStateToNodes = (nodes, state) => {
  let _nodes = []
  for (const node of nodes) {
    _nodes = _nodes.concat(createNodeWithState(node, state))
  }
  if (state.preset === 'who') {
    return _nodes.sort((a, b) => {
      if (whoVariantsOrder.indexOf(a.name) > whoVariantsOrder.indexOf(b.name)) return 1
      if (whoVariantsOrder.indexOf(a.name) < whoVariantsOrder.indexOf(b.name)) return -1
      return 0
    })
  }
  return _nodes
}

export default ({
  api_url,
  area,
  colourPalette,
  fromDate,
  lineageToColourIndex,
  showLineageView,
  toDate
}) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'QUEUE_REFETCH':
        return { ...state, loadedProps: null }
      case 'LOADING':
        return { ...state, loading: action.payload.props }
      case 'FETCHED': {
        const { props, index } = action.payload
        if (Object.entries(state.loading).some(([k, v]) => props[k] !== v)) {
          return state
        }
        return {
          ...state,
          nodeIndex: index,
          loading: null,
          loadedProps: action.payload.props,
          topology: buildFullTopology(Object.keys(index))
        }
      }
      case 'ERROR': {
        throw action.payload
      }
      case 'TOGGLE_OPEN': {
        const { nodeName, isOpen } = action.payload
        return {
          ...state,
          nodeIndex: {
            ...state.nodeIndex,
            [nodeName]: {
              ...state.nodeIndex[nodeName],
              isOpen: !isOpen
            }
          }
        }
      }
      case 'SCROLL_POSITION':
        return { ...state, scrollPosition: action.payload }
      case 'SEARCH':
        return { ...state, search: action.payload }
      case 'PRESET':
        return { ...state, preset: action.payload }
      default:
        return state
    }
  }, {
    search: '',
    loadedProps: null,
    nodeIndex: null,
    topology: [],
    scrollPosition: null,
    preset: 'all'
  })

  const { loadedProps } = state

  useEffect(() => {
    if (
      showLineageView && loadedProps !== null && (
        loadedProps.area !== area ||
        loadedProps.fromDate !== fromDate ||
        loadedProps.toDate !== toDate
      )) {
      dispatch({ type: 'QUEUE_REFETCH' })
    }
  }, [showLineageView])

  useEffect(() => { dispatch({ type: 'QUEUE_REFETCH' }) }, [area, fromDate, toDate])

  const toAlias = useReverseAliasLookup()

  useEffect(async () => {
    if (!showLineageView || loadedProps !== null) return
    try {
      dispatch({ type: 'LOADING', payload: { props: { area, fromDate, toDate } } })
      let lineageData = await fetchLineages(api_url, { area, fromDate, toDate })
      if (!Array.isArray(lineageData)) {
        lineageData = Object.entries(lineageData)
          .map(([pango_clade, sum]) => ({
            pango_clade,
            sum
            // lineage: ?
          }))
      }
      const index = Object.fromEntries(
        lineageData.map(l => {
          const expanded = l.pango_clade.slice(0, -1)
          return [
            expanded,
            { ...l, sum: parseInt(l.sum) }
          ]
        })
      )
      dispatch({ type: 'FETCHED', payload: { index, props: { area, fromDate, toDate } } })
    } catch (e) {
      dispatch({ type: 'ERROR', payload: e })
    }
  }, [showLineageView, loadedProps])

  const toggleOpen = useCallback((nodeName, isOpen) => {
    dispatch({ type: 'TOGGLE_OPEN', payload: { nodeName, isOpen } })
  }, [dispatch])

  const selectedLineages = useMemo(
    () => Object.keys(lineageToColourIndex).map(k => k.split('+')[0]),
    [lineageToColourIndex]
  )
  const numberSelected = selectedLineages.length

  const topology = useMemo(() => {
    const { topology, ...rest } = state
    return mapStateToNodes(topology, { ...rest, selectedLineages, toAlias })
  }, [state.topology, state.preset, toAlias])

  return useMemo(() => ({
    colourPalette,

    // state
    ...state,
    isLoading: loadedProps === null,
    numberSelected,
    topology,

    // actions
    setScrollPosition: pos => dispatch({ type: 'SCROLL_POSITION', payload: pos }),
    setSearch: text => dispatch({ type: 'SEARCH', payload: text }),
    setPreset: preset => dispatch({ type: 'PRESET', payload: preset }),
    toggleOpen
  }), [state, numberSelected, topology, colourPalette])
}
