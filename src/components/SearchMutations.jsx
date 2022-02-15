import React, { useState } from 'react'

import Select from './Select'
import Input from './TextInput'
import { Heading } from './Typography'
import MutationsList from './MutationsList'

import { expandLineage } from '../pango'

// const MutationsHelp = () => (
//   <div className='p-3 text-xs tracking-wide space-y-1.5 w-48 flex flex-col justify-center'>
//     {/* <h4 className='font-bold text-subheading'>Guidance</h4> */}
//     <p>Add up to two mutations separated by a &ldquo;+&rdquo; character.</p>
//     <p>Two mutations are considered a boolean AND.</p>
//   </div>
// )

export const SearchMutations = props => {
  const {
    api_url,
    // genes,
    // lineage
    // lineageToColourIndex
    // submit
    showMutationSearch
  } = props

  const lineage = React.useMemo(() => props.lineage, [])
  const pangoClade = React.useMemo(() => expandLineage(lineage), [lineage])
  const genes = React.useMemo(() => props.genes.sort(), [])
  // const submitMutations = (value) => {
  //   if (value.length) {
  //     const cleanValue = value.split('+').slice(0, 2).map(_ => _.trim()).join('+')
  //     if (cleanValue !== muts) {
  //       applyMutations(lineage, cleanValue, muts ? lineageWithMuts : undefined)
  //     }
  //   }
  // }

  // const applyMutations = useCallback((lineage, muts, replacing) => {
  //   const mutationUpdate = getMutationQueryUpdate(lineage, muts)
  //   const lineageUpdate = { ...lineageToColourIndex }
  //   const newKey = `${lineage}+${muts}`
  //   if (replacing) {
  //     lineageUpdate[newKey] = lineageToColourIndex[replacing]
  //     delete lineageUpdate[replacing]
  //   } else {
  //     lineageUpdate[newKey] = nextColourIndex
  //   }
  //   submit(lineageUpdate, mutationUpdate)
  // }, [getMutationQueryUpdate, lineageToColourIndex])

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
        lineage={pangoClade}
        gene={gene}
        filter={filter}
      />
    </>
  )
}

export default SearchMutations
