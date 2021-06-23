import { useEffect, useState } from 'react'
import useQueryAsState from './useQueryAsState'

export default () => {
  const [{ xMin, xMax }, updateQuery] = useQueryAsState()

  const [zoomEnabled, setZoomEnabled] = useState(false)

  const chartZoom = (xMin && xMax) ? [xMin, xMax] : null

  useEffect(() => {
    if (chartZoom) {
      setZoomEnabled(false)
    }
  }, [chartZoom])

  return {
    chartZoom,
    setChartZoom: (xMin, xMax) => updateQuery({ xMin, xMax }),
    clearChartZoom: () => updateQuery({ xMin: undefined, xMax: undefined }),
    zoomEnabled,
    setZoomEnabled
  }
}
