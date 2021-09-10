import { useMemo } from 'react'

const defaultImpl = {
  dataPath: './data',
  async fetchLists () {
    const response = await fetch(`${this.dataPath}/lists.json`)
    const data = await response.json()
    const lastModified = response.headers.get('last-modified')
    return { data, lastModified }
  },
  async fetchChartData (area) {
    const response = await fetch(`${this.dataPath}/area/${area}.json`)
    const json = await response.json()
    return json.data
  },
  async fetchMapData (lineage, parameter) {
    const response = await fetch(`${this.dataPath}/lineage/${lineage}/${parameter}.json`)
    return response.json()
  }
}

export default function useAPI (overrides) {
  const api = useMemo(() => {
    return {
      ...defaultImpl,
      ...overrides
    }
  }, [])
  return api
}
