import { useEffect, useState, useMemo } from 'react'
import useQueryAsState from './useQueryAsState'

export default () => {
  const [{ xMin, xMax }, updateQuery] = useQueryAsState()

  const [zoomEnabled, setZoomEnabled] = useState(false)

  const dateRange = (xMin && xMax)
    ? xMin < xMax ? [xMin, xMax] : [xMax, xMin]
    : (xMin || xMax) ? [xMin, xMax] : null

  useEffect(() => {
    if (dateRange) {
      setZoomEnabled(false)
    }
  }, [dateRange])

  return useMemo(() => {
    return {
      dateRange,
      setChartZoom: (xMin, xMax) => updateQuery({ xMin, xMax }),
      clearChartZoom: () => updateQuery({ xMin: undefined, xMax: undefined }),
      zoomEnabled,
      setZoomEnabled
    }
  }, [xMin, xMax, zoomEnabled])
}
