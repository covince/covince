import React from 'react'
import wilson from 'wilson-score-interval'
import { expandLineage, topologise } from 'pango-utils'
import useAPI from '../api'

const indexMapResults = (index, results, key) => {
  for (const row of results) {
    const { ltla, date, sum } = row
    if (ltla in index) {
      const dates = index[ltla]
      if (date in dates) {
        dates[date][key] = sum
      } else {
        dates[date] = { [key]: sum }
      }
    } else {
      index[ltla] = { [date]: { [key]: sum } }
    }
  }
}

const defaultConfidence = (count, total) => {
  const _wilson = wilson(count, total)
  return [_wilson.left, _wilson.right]
}

const defaultAvg = count => count / 2

export default ({ api_url, lineages, info, confidence = defaultConfidence, avg = defaultAvg }) => {
  const [unaliasedToAliased, topology] = React.useMemo(() => {
    const memo = {}
    for (const l of lineages) {
      const expanded = expandLineage(l)
      memo[expanded] = l
    }
    return [memo, topologise(Object.keys(memo))]
  }, [lineages])

  const cachedTotals = React.useRef({ key: null, value: null })

  const impl = React.useMemo(() => ({
    async fetchChartData (ltla) {
      const response = await fetch(`${api_url}/frequency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lineages: Object.keys(unaliasedToAliased),
          ltla: ltla === 'overview' ? undefined : ltla
        })
      })
      const json = await response.json()

      const lineageZeroes = Object.fromEntries(lineages.map(l => [l, 0]))
      const index = Object.fromEntries(info.dates.map(d => [d, { ...lineageZeroes, total: 0 }]))
      for (const { date, key, count } of json) {
        if (date in index) {
          index[date][key] = count
          index[date].total += count
        }
      }

      const data = []
      for (const [date, counts] of Object.entries(index)) {
        for (const [key, count] of Object.entries(counts)) {
          if (key === 'total') continue

          const metadata = { date, location: ltla, lineage: unaliasedToAliased[key] || key }
          const [left, right] = confidence(count, counts.total)
          data.push(
            { ...metadata, parameter: 'lambda', mean: avg(count), lower: null, upper: null },
            { ...metadata, parameter: 'p', mean: count / counts.total, lower: Math.abs(left), upper: Math.abs(right) }
          )
        }
      }
      return data
    },
    async fetchMapData (aliased, parameter) {
      const lineage = expandLineage(aliased)
      const useCachedTotals = cachedTotals.current.key === lineages
      const [totalJson, lineageJson] = await Promise.all([
        useCachedTotals
          ? Promise.resolve(cachedTotals.current.value)
          : fetch(`${api_url}/spatiotemporal/total`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lineages: topology.map(_ => _.name) })
          }).then(_ => _.json()),
        fetch(`${api_url}/spatiotemporal/lineage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lineage,
            excluding: Object.keys(unaliasedToAliased).filter(l => l.startsWith(`${lineage}.`))
          })
        }).then(_ => _.json())
      ])
      if (!useCachedTotals) {
        cachedTotals.current = { key: lineages, value: totalJson }
      }
      const index = {}
      indexMapResults(index, totalJson, 'total')
      indexMapResults(index, lineageJson, 'value')

      const uniqueDates = info.dates
      const uniqueLtlas = info.ltlas
      const values = { mean: [], lower: [], upper: [] }
      for (const ltla of uniqueLtlas) {
        const mean = []
        const lower = []
        const upper = []
        for (const date of uniqueDates) {
          if (!(ltla in index) || !(date in index[ltla])) {
            mean.push(null)
            lower.push(null)
            upper.push(null)
            continue
          }
          const { total, value } = index[ltla][date]
          const count = total > 0 ? (value || 0) : null
          if (parameter === 'p') {
            const [left = null, right = null] = count !== null ? confidence(count, total) : []
            mean.push(count / total)
            lower.push(Math.abs(left))
            upper.push(right)
          } else {
            mean.push(avg(count))
            lower.push(null)
            upper.push(null)
          }
        }
        values.mean.push(mean)
        values.lower.push(lower)
        values.upper.push(upper)
      }
      return {
        dates: uniqueDates,
        areas: uniqueLtlas,
        values
      }
    }
  }), [unaliasedToAliased])

  return useAPI(null, impl)
}
