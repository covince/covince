import React, { useRef } from 'react'

import Chart from './Chart'
import Chloropleth from './Chloropleth'
import DateFilter from './DateFilter'
import FilterSection from './FilterSection'
import MapView from './MapView'
import LineageFilter from './LineageFilter'
import LocalIncidence from './LocalIncidence'
import LocationFilter from './LocationFilter'
import StickyMobileSection from './StickyMobileSection'

const originals = {
  Chart,
  Chloropleth,
  DateFilter,
  FilterSection,
  MapView,
  LineageFilter,
  LocalIncidence,
  LocationFilter,
  StickyMobileSection
}

export const InjectionContext = React.createContext({})

export const useInjection = () => {
  const { decorators = {}, props = {} } = React.useContext(InjectionContext)

  const previousDecorators = useRef({})
  const previousComponents = useRef({})

  const components = React.useMemo(() => {
    const _components = { ...originals }
    for (const [key, decorator] of Object.entries(decorators)) {
      if (key in originals) {
        _components[key] =
          previousDecorators.current[key] === decorator
            ? previousComponents.current[key]
            : decorator(originals[key])
        previousComponents.current[key] = _components[key]
        previousDecorators.current[key] = decorator
      } else {
        console.log('[CovInce]', 'component not recognised:', key)
      }
    }
    return _components
  }, [decorators])

  return [components, props]
}
