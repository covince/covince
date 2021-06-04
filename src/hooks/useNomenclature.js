import { useMemo } from 'react'
import useQueryAsState from './useQueryAsState'

const schemes = {
  pango: {
    A: 'A',
    B: 'B',
    'B.1.1.7': 'B.1.1.7',
    'B.1.177': 'B.1.177',
    'B.1.351': 'B.1.351',
    'B.1.525': 'B.1.525',
    'B.1.617': 'B.1.617',
    'B.1.617.2': 'B.1.617.2',
    'P.1': 'P.1',
    other: 'other'
  },
  who: {
    'B.1.1.7': 'Alpha',
    'B.1.351': 'Beta',
    'P.1': 'Gamma',
    'B.1.617.2': 'Delta',
    'B.1.525': 'Eta'
    // other: 'Other'
  },
  nextstrain: {
    'B.1.1.7': '20I/501Y.V1',
    'B.1.177': '20E (EU1)',
    'B.1.351': '20H/501Y.V2',
    'B.1.525': '20A/S:484K',
    'B.1.617.2': '21A/S:478K',
    'P.1': '20J/501Y.V2'
    // other: 'Other'
  }
}

export default (lineages = []) => {
  const [{ nomenclature }, updateQuery] = useQueryAsState({ nomenclature: 'pango' })

  return {
    nomenclature,
    schemes: Object.keys(schemes),
    // schemes: ['pango', ...Object.keys(schemes)],
    setScheme: scheme => updateQuery({ nomenclature: scheme }),
    hasLineage: name => {
      if (nomenclature === 'pango') return name
      return name in schemes[nomenclature]
    },
    getName: name => {
      if (nomenclature === 'pango') return name
      return schemes[nomenclature][name]
    }
  }
}
