import { useReducer, useEffect, useCallback, useMemo } from 'react'
import { toAlias, buildFullTopology } from 'pango-utils'

import { whoVariants } from '../hooks/useDynamicConfig'
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

const createNodeWithState = (node, state, parentWho) => {
  const { nodeIndex, preset, lineageToColourIndex } = state
  const {
    lineage = node.name,
    sum = 0,
    selected = lineage in lineageToColourIndex
  } = nodeIndex[node.name] || {}
  const alias = toAlias[node.name]
  const who = whoVariants[lineage]

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
    label: lineage,
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
      if (whoVariantsOrder.indexOf(a.label) > whoVariantsOrder.indexOf(b.label)) return 1
      if (whoVariantsOrder.indexOf(a.label) < whoVariantsOrder.indexOf(b.label)) return -1
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
      case 'FETCHED': {
        const nodeIndex = action.payload.index
        return {
          ...state,
          nodeIndex,
          loadedProps: action.payload.props,
          topology: buildFullTopology(Object.keys(nodeIndex))
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

  useEffect(async () => {
    if (!showLineageView || loadedProps !== null) return
    try {
      const lineageData = await fetchLineages(api_url, { area, fromDate, toDate })
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

  const numberSelected = useMemo(() => Object.keys(lineageToColourIndex).length, [lineageToColourIndex])

  const topology = useMemo(() => {
    const { topology, ...rest } = state
    return mapStateToNodes(topology, { ...rest, lineageToColourIndex })
  }, [state.topology, state.preset])

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
