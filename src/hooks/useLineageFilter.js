import { useMemo } from 'react'

import useQueryAsState from './useQueryAsState'

const colours = [
  '#332288', // indigo
  '#88CCEE', // cyan
  '#44AA99', // teal
  '#117733', // green
  '#999933', // olive
  '#DDCC77', // sand
  '#CC6677', // rose
  '#882255', // wine
  '#AA4499', // purple
  '#DDDDDD' // grey
]

export default (uniqueLineages) => {
  const [{ show }, updateQuery] = useQueryAsState()

  const queryLineages = useMemo(() =>
    new Set(show === undefined ? uniqueLineages : show.split(','))
  , [show])

  const activeLineages = useMemo(() =>
    uniqueLineages.reduce((memo, lineage, index) => {
      memo[lineage] = {
        colour: colours[index],
        active: queryLineages.has(lineage)
      }
      return memo
    }, {})
  , [queryLineages])

  return {
    activeLineages,
    toggleLineage: lineage => {
      queryLineages[queryLineages.has(lineage) ? 'delete' : 'add'](lineage)
      updateQuery({ show: Array.from(queryLineages).join(',') })
    }
  }
}
