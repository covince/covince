import { useMemo } from 'react'

import getConfig from '../config'

export default () => {
  const { nomenclature } = getConfig()

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
