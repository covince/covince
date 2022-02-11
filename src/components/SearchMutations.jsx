import React from 'react'

import { Heading } from './Typography'

const SearchMutations = props => {
  const {
    lineage,
    // submit
    showMutationSearch
  } = props
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
