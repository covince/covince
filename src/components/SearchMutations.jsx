import React from 'react'

import { Heading } from './Typography'

// const MutationsHelp = () => (
//   <div className='p-3 text-xs tracking-wide space-y-1.5 w-48 flex flex-col justify-center'>
//     {/* <h4 className='font-bold text-subheading'>Guidance</h4> */}
//     <p>Add up to two mutations separated by a &ldquo;+&rdquo; character.</p>
//     <p>Two mutations are considered a boolean AND.</p>
//   </div>
// )

export const SearchMutations = props => {
  const {
    // lineage
    // lineageToColourIndex
    // submit
    showMutationSearch
  } = props

  const lineage = React.useMemo(() => props.lineage, [])

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
    </>
  )
}

export default SearchMutations
