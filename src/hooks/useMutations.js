import { useCallback, useMemo } from 'react'
import useQueryAsState from './useQueryAsState'

export default () => {
  const [{ mutations = '' }] = useQueryAsState()

  const lineageToMutations = useMemo(() => {
    const muts = mutations.split(',')
    return Object.fromEntries(muts.map(m => {
      const i = m.indexOf('+')
      return [m.slice(0, i), m.slice(i + 1)]
    }))
  }, [mutations])

  const getMutationQueryUpdate = useCallback((lineage, newMuts, insert = true) => {
    return {
      mutations:
        mutations
          .split(',')
          .filter(m => !m.startsWith(`${lineage}+`))
          .concat(insert ? `${lineage}+${newMuts}` : [])
          .join(',')
    }
  }, [mutations])

  return {
    lineageToMutations,
    getMutationQueryUpdate
  }
}
