import React, { useState, useMemo } from 'react'

import Select from './Select'
import Input from './TextInput'
import { Heading } from './Typography'
import MutationsList from './MutationsList'
import Button from './Button'

import useMutations from '../hooks/useMutations'
import useDebouncedValue from '../hooks/useDebouncedValue'

import { expandLineage } from '../pango'
import { BsX } from 'react-icons/bs'

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

const ManageSelection = ({ muts, secondMut, setSecondMut, removeMutation }) => {
  if (muts.length === 0) {
    return <p className='text-subheading text-sm px-1.5 py-0.5'>Select first mutation below</p>
  }

  return (
    <>
      <h3 className='text-subheading font-bold uppercase text-xs tracking-wider mx-1.5 leading-6'>
        Selected:
      </h3>
      <span className='mx-3'>{muts[0]}</span>
      { secondMut
        ? <span className='text-subheading font-bold'>+</span>
        : <Button
            className='h-6 leading-6 py-0 px-0.5 -ml-1 whitespace-nowrap self-start'
            onClick={removeMutation}
            title='Clear mutation'
          >
            <BsX className='w-5 h-5' />
          </Button> }
      { muts[1]
        ? <>
            <span className='mx-3'>{muts[1]}</span>
            <Button
              className='h-6 leading-6 py-0 px-0.5 whitespace-nowrap self-start'
              onClick={removeMutation}
              title='Clear mutation'
            >
              <BsX className='w-5 h-5' />
            </Button>
          </>
        : <Button className='h-6 leading-6 py-0 px-1.5 whitespace-nowrap ml-3' onClick={() => setSecondMut(!secondMut)}>
            { secondMut ? 'Cancel' : 'Add' } 2nd mut.
          </Button> }
    </>
  )
}

const getNextMuts = (mutsArray, newMut, secondMutMode) => {
  if (mutsArray.length > 0 && secondMutMode) {
    return [mutsArray[0], newMut].join('+')
  }
  return newMut
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

  const lineage = useMemo(() => props.lineage, [])
  const pangoClade = useMemo(() => expandLineage(lineage), [lineage])
  const genes = useMemo(() => props.genes.sort(), [])

  const denominator = useMemo(() => {
    const node = findNode(lineageTree.topology, pangoClade)
    return node ? node.sum + node.sumOfClade : null
  }, [lineageTree.topology])

  const queryParams = useMemo(() => {
    return lineageTree.loading || lineageTree.loadedProps
  }, [lineageTree.loading, lineageTree.loadedProps])

  const { lineageToMutations, getMutationQueryUpdate } = useMutations()

  const currentMuts = lineageToMutations[lineage]
  const splitMuts = currentMuts ? currentMuts.split('+') : []

  const [secondMutMode, setSecondMutMode] = useState(splitMuts.length > 1)

  const maybeFirstMut = useMemo(() =>
    splitMuts.length > 0 && secondMutMode
      ? {
          lineage: `${lineage}+${splitMuts[0]}`,
          pangoClade: `${pangoClade}+${splitMuts[0]}`
        }
      : {
          lineage,
          pangoClade
        }
  , [lineage, secondMutMode, currentMuts])

  const applyMutations = React.useCallback((nextMuts) => {
    const mutationUpdate = getMutationQueryUpdate(lineage, nextMuts)
    const lineageUpdate = { ...lineageToColourIndex }
    const newKey = `${lineage}+${nextMuts}`
    const replacing = currentMuts ? `${lineage}+${currentMuts}` : null
    if (replacing) {
      if (nextMuts) {
        lineageUpdate[newKey] = lineageToColourIndex[replacing]
      }
      delete lineageUpdate[replacing]
    } else {
      lineageUpdate[newKey] = lineageTree.nextColourIndex
    }
    submit(lineageUpdate, mutationUpdate)
  }, [getMutationQueryUpdate, lineageToColourIndex])

  const removeMutation = React.useCallback(() => {
    applyMutations(splitMuts.slice(0, -1).join('+'))
    setSecondMutMode(false)
  }, [currentMuts])

  const addMutation = React.useCallback((mut) => {
    const nextMuts = getNextMuts(splitMuts, mut, secondMutMode)
    applyMutations(nextMuts)
  }, [currentMuts, secondMutMode])

  const [gene, setGene] = useState('')
  const [filter, setFilter] = useState('')
  const debouncedfilter = useDebouncedValue(filter, 250)
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
      <section className='mt-3 p-1.5 rounded border border-gray-200 dark:border-gray-500 flex items-baseline text-center text-sm max-w-max'>
        <ManageSelection
          muts={splitMuts}
          secondMut={secondMutMode}
          setSecondMut={setSecondMutMode}
          removeMutation={removeMutation}
        />
      </section>
      <form className='mt-4 mb-1.5'>
        <div className='flex items-center space-x-1.5'>
          <Select value={gene} onChange={e => setGene(e.target.value)}>
            <option value=''>(gene)</option>
            {genes.map(g => <option key={g} value={g}>{g}</option>)}
          </Select>
          <p>:</p>
          <Input
            onChange={e => setFilter(e.target.value.toUpperCase())}
            placeholder='filter mutations'
            value={filter}
          />
        </div>
      </form>
      <MutationsList
        api_url={api_url}
        denominator={denominator}
        pangoClade={maybeFirstMut.pangoClade}
        gene={gene}
        filter={debouncedfilter}
        queryParams={queryParams}
        loading={lineageTree.isLoading}
        selected={splitMuts}
        selectMutation={addMutation}
      />
    </>
  )
}

export default SearchMutations
