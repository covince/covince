let aliases = null
export const setAliases = _aliases => { aliases = _aliases }
export const getAliases = () => aliases

export const getReverseAliasLookup = () =>
  aliases === null
    ? {}
    : Object.fromEntries(
      Object.entries(aliases).map(entry => entry.reverse())
    )

export const expandLineage = lineage => {
  if (aliases === null) return lineage
  const parts = lineage.split('.')
  const [root, ...rest] = parts
  return aliases[root] ? [aliases[root], ...rest].join('.') : lineage
}

export const topologise = (lineages, fillGaps = false) => {
  const root = { name: '', children: [] }
  const nodes = { '': root }
  for (const name of lineages) {
    if (name in nodes) continue
    let node = { name, children: [] }
    nodes[name] = node
    const levels = name.split('.')
    while (levels.length > 0) {
      levels.splice(-1)
      const parent = levels.join('.')
      if (parent in nodes) {
        nodes[parent].children.push(node)
        break
      }
      if (fillGaps || lineages.includes(parent)) {
        node = { name: parent, children: [node] }
        nodes[parent] = node
      }
    }
  }
  return root.children
}

export const buildFullTopology = lineages => topologise(lineages, true)

export const findNode = (topo, pango) => {
  let n = null
  for (const node of topo) {
    if (node.name === pango) {
      return node
    }
    if (pango.startsWith(node.name)) {
      n = findNode(node.children, pango)
      if (n != null) {
        break
      }
    }
  }
  return n
}

const lineageRegex = /^[A-Z]{1,3}(\.[0-9]+)*$/

export const isPangoLineage = string => lineageRegex.test(string)

export const whoVariants = {
  'B.1.1.7': 'Alpha',
  'B.1.351': 'Beta',
  'B.1.1.28.1': 'Gamma',
  'B.1.617.2': 'Delta',
  'B.1.429': 'Epsilon',
  'B.1.427': 'Epsilon',
  'B.1.1.28.2': 'Zeta',
  'B.1.525': 'Eta',
  'B.1.1.28.3': 'Theta',
  'B.1.526': 'Iota',
  'B.1.617.1': 'Kappa',
  'B.1.1.1.37': 'Lambda',
  'B.1.621': 'Mu',
  'B.1.1.529': 'Omicron'
}
