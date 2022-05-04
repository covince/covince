import React from 'react'
import wilson from 'wilson-score-interval'
import { expandLineage, getChildLineages, topologise } from '../pango'
import useAPI from '../api'

const v2Compat = (data, dates, { key = 'key', countKey = 'sum', smoothing = 1 } = {}) => {
  if (!Array.isArray(data)) { // is v2 backend response
    let tmp
    if (smoothing > 1) {
      tmp = {}
      for (const [date, counts] of Object.entries(data)) {
        tmp[date] = tmp[date] || {}
        const dateIndex = dates.indexOf(date)
        const forwardDates = dates.slice(dateIndex + 1, dateIndex + smoothing)
        for (const [k, count] of Object.entries(counts)) {
          tmp[date][k] = count
          for (const d of forwardDates) {
            if (d in tmp) {
              tmp[d][k] = 0
            } else {
              tmp[d] = { [k]: 0 }
            }
          }
        }
      }
    } else {
      tmp = data
    }

    const _data = []
    for (const [date, counts] of Object.entries(tmp)) {
      const dateIndex = dates.indexOf(date)
      for (const [k, count] of Object.entries(counts)) {
        let period_count = 0
        if (dateIndex === -1 || smoothing === 1) {
          period_count = count
        } else {
          const periodDates = dates.slice(Math.max(0, dateIndex - (smoothing - 1)), dateIndex + 1)
          for (const date of periodDates) {
            const counts = tmp[date]
            period_count += counts ? counts[k] || 0 : 0
          }
        }
        _data.push({ date, [key]: k, [countKey]: period_count })
      }
    }
    return _data
  }
  return data
}

export const indexMapResults = (index, results, key, countKey = 'sum') => {
  for (const row of results) {
    const { area, date, [countKey]: value } = row
    if (area in index) {
      const dates = index[area]
      if (date in dates) {
        dates[date][key] = value
      } else {
        dates[date] = { [key]: value }
      }
    } else {
      index[area] = { [date]: { [key]: value } }
    }
  }
}

export const createMapArrays = ({ index, dates, areas, transform }) => {
  const values = { counts: [], mean: [], lower: [], upper: [] }
  for (const area of areas) {
    const counts = []
    const mean = []
    const lower = []
    const upper = []
    for (const date of dates) {
      if (!(area in index) || !(date in index[area])) {
        counts.push(0)
        mean.push(null)
        lower.push(null)
        upper.push(null)
        continue
      }
      const entry = index[area][date]
      const mapped = transform(entry)
      counts.push(mapped.count)
      mean.push(mapped.mean)
      lower.push(mapped.lower)
      upper.push(mapped.upper)
    }
    values.counts.push(counts)
    values.mean.push(mean)
    values.lower.push(lower)
    values.upper.push(upper)
  }
  return values
}

export const defaultConfidence = (count, total) => {
  const { left, right } = wilson(count, total)
  return [Math.abs(left), Math.min(Math.abs(right), 1)]
}

const queryStringify = query => new URLSearchParams(query).toString()

export const useLineagesForAPI = (lineages) => {
  return React.useMemo(() => {
    const memo = {}
    for (const l of lineages) {
      const expanded = expandLineage(l)
      memo[expanded] = l
    }
    const expandedLineages = Object.keys(memo)
    const topology = topologise(expandedLineages.filter(_ => !_.includes('+')))
    const rootLineages = topology.map(_ => _.name)
    return {
      expandedLineages,
      topology,
      unaliasedToAliased: memo,
      denominatorLineages: [
        ...rootLineages,
        ...expandedLineages.filter(l => l.includes('+') && !rootLineages.some(r => l.startsWith(r)))
      ]
    }
  }, [lineages])
}

export const getExcludedLineages = (expandedLineages, topology, lineage) => {
  const lineageWithoutMut =
    lineage.includes('+')
      ? lineage.slice(0, lineage.indexOf('+'))
      : lineage
  return lineage.includes('+')
    ? topologise(
      expandedLineages.filter(l => l !== lineage && l !== lineageWithoutMut && `${l}.`.startsWith(`${lineageWithoutMut}.`))
    ).map(_ => _.name)
    : [
        ...expandedLineages.filter(l => l !== lineage && l.startsWith(`${lineageWithoutMut}+`)),
        ...getChildLineages(topology, lineageWithoutMut)
      ]
}

export default ({
  api_url,
  lineages,
  info,
  confidence = defaultConfidence,
  smoothing = 1,
  avg = count => count / smoothing
}) => {
  const { unaliasedToAliased, expandedLineages, topology, denominatorLineages } = useLineagesForAPI(lineages)

  const cachedTotals = React.useRef({ key: null, value: [] })

  const impl = React.useMemo(() => ({
    async fetchChartData (area) {
      if (lineages.length === 0) {
        return []
      }

      const query = new URLSearchParams({
        lineages: expandedLineages
      })
      if (area !== 'overview') {
        query.append('area', area)
      }
      const response = await fetch(`${api_url}/frequency?${query.toString()}`)
      let json = await response.json()
      json = v2Compat(json, info.dates, { countKey: 'period_count', smoothing })

      const lineageZeroes = Object.fromEntries(expandedLineages.map(l => [l, 0]))
      const index = Object.fromEntries(info.dates.map(d => [d, { ...lineageZeroes, total: 0 }]))

      for (const { date, key, period_count: count } of json) {
        if (date in index) {
          index[date][key] = count
          index[date].total += count
        }
      }

      const data = []
      for (const [date, counts] of Object.entries(index)) {
        for (const [key, count] of Object.entries(counts)) {
          if (key === 'total') continue

          const metadata = { date, location: area, lineage: unaliasedToAliased[key] || key }
          const [left, right] = confidence(count, counts.total)
          data.push(
            { ...metadata, parameter: 'lambda', count, mean: avg(count), lower: null, upper: null },
            { ...metadata, parameter: 'p', mean: count / counts.total, lower: Math.abs(left), upper: Math.abs(right) }
          )
        }
      }
      return data
    },
    async fetchMapData (aliased = '', parameter) {
      const lineage = expandLineage(aliased)
      const useCachedTotals = cachedTotals.current.key === lineages
      const [totalJson, lineageJson] =
        lineages.length === 0
          ? [[], []]
          : await Promise.all([
            useCachedTotals
              ? Promise.resolve(cachedTotals.current.value)
              : fetch(`${api_url}/spatiotemporal/total?${queryStringify({ lineages: denominatorLineages })}`)
                .then(_ => _.json())
                .then(_ => v2Compat(_, info.dates, { key: 'area', smoothing })),
            fetch(`${api_url}/spatiotemporal/lineage?${queryStringify({
              lineage,
              excluding: getExcludedLineages(expandedLineages, topology, lineage)
            })}`)
              .then(_ => _.json())
              .then(_ => v2Compat(_, info.dates, { key: 'area', smoothing }))
          ])
      if (!useCachedTotals) {
        cachedTotals.current = { key: lineages, value: totalJson }
      }
      const index = {}

      indexMapResults(index, totalJson, 'total')
      indexMapResults(index, lineageJson, 'value')

      const uniqueDates = info.dates
      const uniqueAreas = info.areas
      const values = createMapArrays({
        areas: uniqueAreas,
        dates: uniqueDates,
        index,
        transform: parameter === 'p'
          ? ({ value, total }) => {
              const count = value || 0
              const [left = null, right = null] = count !== null ? confidence(count, total) : []
              return { count, mean: count / total, lower: left, upper: right }
            }
          : ({ value }) => {
              const count = value || 0
              return { count, mean: avg(count), lower: null, upper: null }
            }
      })

      return {
        dates: uniqueDates,
        areas: uniqueAreas,
        values
      }
    }
  }), [unaliasedToAliased])

  return useAPI(null, impl)
}
