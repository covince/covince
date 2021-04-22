import { useMemo } from 'react'

import useQueryAsState from './useQueryAsState'

export default (uniqueLineages, colours) => {
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
