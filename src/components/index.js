import Card from './Card'
import Chloropleth from './Chloropleth'
import DateFilter from './DateFilter'
import FadeTransition from './FadeTransition'
import FilterSection from './FilterSection'
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
  LineageFilter,
  LocalIncidence,
  LocationFilter,
  Select,
  Spinner,
  StickyMobileSection
}

const components = { ...originals }

export function register (newComponents) {
  for (const [key, decorator] of Object.entries(newComponents)) {
    if (key in originals) {
      components[key] = decorator(originals[key])
    } else {
      console.log('[CovInce]', 'component not recognised:', key)
    }
  }
}

export default components
