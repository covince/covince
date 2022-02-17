import React, { useState } from 'react'

import Select from './Select'
import Input from './TextInput'
import { Heading } from './Typography'
import MutationsList from './MutationsList'

import useMutations from '../hooks/useMutations'

import { expandLineage } from '../pango'

// const MutationsHelp = () => (
//   <div className='p-3 text-xs tracking-wide space-y-1.5 w-48 flex flex-col justify-center'>
//     {/* <h4 className='font-bold text-subheading'>Guidance</h4> */}
//     <p>Add up to two mutations separated by a &ldquo;+&rdquo; character.</p>
//     <p>Two mutations are considered a boolean AND.</p>
//   </div>
// )

const findNode = (topo, pango) => {
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

export const SearchMutations = props => {
  const {
    api_url,
    lineageTree,
    // genes,
    // lineage
    lineageToColourIndex,
    submit,
    showMutationSearch
  } = props

  const lineage = React.useMemo(() => props.lineage, [])
  const pangoClade = React.useMemo(() => expandLineage(lineage), [lineage])
  const genes = React.useMemo(() => props.genes.sort(), [])

  const denominator = React.useMemo(() => {
    const node = findNode(lineageTree.topology, pangoClade)
    return node ? node.sum + node.sumOfClade : null
  }, [lineageTree.topology])

  const queryParams = React.useMemo(() => {
    return lineageTree.loading || lineageTree.loadedProps
  }, [lineageTree.loading, lineageTree.loadedProps])

  const { lineageToMutations, getMutationQueryUpdate } = useMutations()

  const currentMut = lineageToMutations[lineage]

  const applyMutations = React.useCallback((mut) => {
    const mutationUpdate = getMutationQueryUpdate(lineage, mut)
    const lineageUpdate = { ...lineageToColourIndex }
    const newKey = `${lineage}+${mut}`
    const replacing = currentMut ? `${lineage}+${currentMut}` : null
    if (replacing) {
      lineageUpdate[newKey] = lineageToColourIndex[replacing]
      delete lineageUpdate[replacing]
    } else {
      lineageUpdate[newKey] = '1' // TODO: use next colour index algo
    }
    submit(lineageUpdate, mutationUpdate)
  }, [getMutationQueryUpdate, lineageToColourIndex])

  const [gene, setGene] = useState('')
  const [filter, setFilter] = useState('')

  return (
    <>
      <header className='flex items-baseline'>
        <Heading>Mutations in {lineage}</Heading>
        <button
          className='text-subheading dark:text-dark-subheading h-6 px-1 mx-1.5 flex items-center text-sm border border-transparent focus:primary-ring rounded'
          onClick={() => showMutationSearch(undefined)}
        >
          Back to Lineages
        </button>
      </header>
      <form className='my-4'>
        <div className='flex items-center space-x-1.5'>
          <Select value={gene} onChange={e => setGene(e.target.value)}>
            <option value=''>(gene)</option>
            {genes.map(g => <option key={g} value={g}>{g}</option>)}
          </Select>
          <p>:</p>
          <Input value={filter} onChange={e => setFilter(e.target.value)}/>
        </div>
      </form>
      <MutationsList
        api_url={api_url}
        denominator={denominator}
        lineage={pangoClade}
        gene={gene}
        filter={filter}
        queryParams={queryParams}
        loading={lineageTree.isLoading}
        selected={currentMut}
        selectMutation={applyMutations}
      />
    </>
  )
}

export default SearchMutations
