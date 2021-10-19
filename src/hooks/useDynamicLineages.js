import { useCallback, useMemo } from 'react'

import useQueryAsState from './useQueryAsState'

// Tol Muted
export const lightModeColours = [
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
export const darkModeColours = [
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

export const colourPalette =
  lightModeColours.map((_, i) => ({ light: _.hex, dark: darkModeColours[i].hex }))

export default () => {
  const [{ lineages, colours }, updateQuery] = useQueryAsState({
    lineages: 'A,B,B.1.1.7,B.1.177,B.1.351,B.1.617.2',
    colours: '7,3,1,0,4,6'
  })

  const submit = useCallback((lineageToColourIndexes, extraQueryUpdates) => {
    const entries = Object.entries(lineageToColourIndexes)
    const lineages = entries.map(_ => _[0])
    const colours = entries.map(_ => _[1])
    updateQuery({
      ...extraQueryUpdates,
      lineages: lineages.join(',') || '',
      colours: colours.join(',') || '',
      show: undefined
    })
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

  return {
    lineages: parsedLineages,
    colourIndexes: parsedColourIndexes,
    lineageToColourIndex,
    submit
  }
}
