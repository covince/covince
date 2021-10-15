import { useMemo } from 'react'

import { useConfig } from '../config'

export default () => {
  const { nomenclature } = useConfig()

  const nomenclatureLookup = useMemo(() => {
    const lookup = {}
    for (const { lineage, alt_name } of nomenclature) {
      lookup[lineage] = alt_name
    }
    return lookup
  }, [nomenclature])

  return {
    nomenclature,
    nomenclatureLookup
  }
}
