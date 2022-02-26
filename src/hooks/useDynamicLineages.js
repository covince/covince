import { useCallback, useMemo } from 'react'

import useQueryAsState from './useQueryAsState'

// Tol Muted
const lightModeColours = [
  { hex: '#CC6677', desc: 'rose' },
  { hex: '#332288', desc: 'indigo' },
  { hex: '#DDCC77', desc: 'sand' },
  { hex: '#117733', desc: 'green' },
  { hex: '#88CCEE', desc: 'cyan' },
  { hex: '#882255', desc: 'wine' },
  { hex: '#44AA99', desc: 'teal' },
  { hex: '#999933', desc: 'olive' },
  { hex: '#AA4499', desc: 'purple' }
  // { hex: '#DDDDDD', desc: 'grey' }
]

// Tol Light
const darkModeColours = [
  { hex: '#FFAABB', desc: 'pink' },
  { hex: '#77AADD', desc: 'light blue' },
  { hex: '#EEDD88', desc: 'light yellow' },
  { hex: '#BBCC33', desc: 'pear' },
  { hex: '#99DDFF', desc: 'light cyan' },
  { hex: '#EE8866', desc: 'orange' },
  { hex: '#44BB99', desc: 'mint' },
  { hex: '#AAAA00', desc: 'olive' },
  { hex: '#be5bad', desc: 'light purple' }
  // { hex: '#DDDDDD', desc: 'pale grey' }
]

const defaultColourPalette =
  lightModeColours.map((_, i) => ({ light: _.hex, dark: darkModeColours[i].hex }))

const initialise = ({ dynamic_mode }) => {
  if (dynamic_mode === undefined) {
    throw new Error('[CovInce] `dynamic_mode` is required in config.')
  }
  const palette = dynamic_mode.colour_palette || defaultColourPalette
  const lineages = dynamic_mode.initial_lineages
  return {
    initial: {
      lineages: Object[Array.isArray(lineages) ? 'values' : 'keys'](lineages).join(','),
      colours: Object[Array.isArray(lineages) ? 'keys' : 'values'](lineages).join(',')
    },
    colourPalette: palette.map(item =>
      typeof item === 'string' ? { light: item, dark: item } : item
    )
  }
}

export const getNextColourIndex = (lineageToColourIndex, colourPalette) => {
  const colours = Object.values(lineageToColourIndex)
  const unique = new Set(colours)
  for (let i = 0; i < colourPalette.length; i++) {
    if (unique.has(i.toString())) continue
    return i.toString()
  }
  return colours.length % colourPalette.length
}

export default (config) => {
  const { initial, colourPalette } = useMemo(() => config ? initialise(config) : {}, [config])
  const [{ lineages, colours }, updateQuery] = useQueryAsState(initial)

  const submit = useCallback((lineageToColourIndexes, extraQueryUpdates) => {
    const nextLineages = Object.keys(lineageToColourIndexes)
    const nextColours = Object.values(lineageToColourIndexes)
    const nextQuery = {
      ...extraQueryUpdates,
      lineages: nextLineages.join(',') || '',
      colours: nextColours.join(',') || '',
      show: undefined
    }
    updateQuery(nextQuery)
  }, [])

  const parsedLineages = useMemo(() => lineages.length ? lineages.split(',') : [], [lineages])
  const parsedColourIndexes = useMemo(() => colours.length ? colours.split(',') : [], [colours])

  const lineageToColourIndex = useMemo(() => {
    const pairs = {}
    parsedLineages.forEach((lineage, i) => {
      pairs[lineage] = parsedColourIndexes[i]
    })
    return pairs
  }, [parsedLineages, parsedColourIndexes])

  const nextColourIndex = useMemo(() =>
    getNextColourIndex(lineageToColourIndex, colourPalette)
  , [lineageToColourIndex])

  return {
    colourPalette,
    colourIndexes: parsedColourIndexes,
    lineages: parsedLineages,
    lineageToColourIndex,
    nextColourIndex,
    submit
  }
}
