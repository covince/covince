import React from 'react'

import Card from './Card'
import Chloropleth from './Chloropleth'
import DateFilter from './DateFilter'
import FadeTransition from './FadeTransition'
import FilterSection from './FilterSection'
import MapView from './MapView'
import LineageFilter from './LineageFilter'
import LocalIncidence from './LocalIncidence'
import LocationFilter from './LocationFilter'
import Select from './Select'
import Spinner from './Spinner'
import StickyMobileSection from './StickyMobileSection'

const originals = {
  Card,
  Chloropleth,
  DateFilter,
  FadeTransition,
  FilterSection,
  MapView,
  LineageFilter,
  LocalIncidence,
  LocationFilter,
  Select,
  Spinner,
  StickyMobileSection
}

export const ComponentDecoratorContext = React.createContext({})

export const useComponents = () => {
  const decorators = React.useContext(ComponentDecoratorContext)
  const components = React.useMemo(() => {
    const _components = { ...originals }
    for (const [key, decorator] of Object.entries(decorators)) {
      if (key in originals) {
        _components[key] = decorator(originals[key])
      } else {
        console.log('[CovInce]', 'component not recognised:', key)
      }
    }
    return _components
  }, [decorators])
  return components
}
