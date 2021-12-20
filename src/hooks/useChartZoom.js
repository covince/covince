import { useEffect, useState } from 'react'
import useQueryAsState from './useQueryAsState'

export default () => {
  const [{ xMin, xMax }, updateQuery] = useQueryAsState()

  const [zoomEnabled, setZoomEnabled] = useState(false)

  const dateRange = (xMin || xMax)
    ? xMin < xMax ? [xMin, xMax] : [xMax, xMin]
    : null

  useEffect(() => {
    if (dateRange) {
      setZoomEnabled(false)
    }
  }, [dateRange])

  return {
    dateRange,
    setChartZoom: (xMin, xMax) => updateQuery({ xMin, xMax }),
    clearChartZoom: () => updateQuery({ xMin: undefined, xMax: undefined }),
    zoomEnabled,
    setZoomEnabled
  }
}
