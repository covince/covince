import React, { useState, useMemo } from 'react'
import classNames from 'classnames'
import { BsX } from 'react-icons/bs'

import Select from './Select'
import Input from './TextInput'
import { Heading } from './Typography'
import MutationsList from './MutationsList'
import Button from './Button'

import useMutations from '../hooks/useMutations'
import useDebouncedValue from '../hooks/useDebouncedValue'

import { expandLineage } from '../pango'

const ManageSelection = ({ muts, secondMut, setSecondMut, removeMutation }) => (
  <section className='mt-3 p-1.5 rounded border border-gray-200 dark:border-gray-500 flex items-baseline'>
    <h3 className='text-subheading font-bold uppercase text-xs tracking-wider mx-1.5 leading-6'>
      Selected:
    </h3>
    <div className='mx-1.5 space-x-3 flex flex-wrap items-baseline text-center text-sm max-w-max'>
      { muts.length === 0
        ? <p className='text-subheading text-sm'>none</p>
        : <>
            <span className=''>{muts[0]}</span>
            { secondMut
              ? <span className='text-subheading font-bold'>+</span>
              : <Button
                  className='h-6 leading-6 py-0 px-0.5 -ml-1 whitespace-nowrap self-center'
                  onClick={removeMutation}
                  title='Clear mutation'
                >
                  <BsX className='w-5 h-5' />
                </Button> }
            { muts[1]
              ? <>
                  <span className='mx-3'>{muts[1]}</span>
                  <Button
                    className='h-6 leading-6 py-0 px-0.5 whitespace-nowrap self-center'
                    onClick={removeMutation}
                    title='Clear mutation'
                  >
                    <BsX className='w-5 h-5' />
                  </Button>
                </>
              : <Button className='h-6 leading-6 py-0 px-1.5 whitespace-nowrap ml-3 self-center' onClick={() => setSecondMut(!secondMut)}>
                  { secondMut ? 'cancel' : 'Add' } 2nd mut.
                </Button> }
          </> }
    </div>
  </section>
)

const getNextMuts = (mutsArray, newMut, secondMutMode) => {
  if (mutsArray.length > 0 && secondMutMode) {
    return [mutsArray[0], newMut].join('+')
  }
  return newMut
}

export const SearchMutations = props => {
  const {
    api_url,
    isMobile,
    lineageToColourIndex,
    nextColourIndex,
    queryParams,
    showMutationSearch,
    submit
  } = props

  const lineage = useMemo(() => props.lineage, [])
  const pangoClade = useMemo(() => expandLineage(lineage), [lineage])
  const genes = useMemo(() => props.genes.sort(), [])

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
      lineageUpdate[newKey] = nextColourIndex
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
      <header className={classNames('flex h-6', isMobile ? 'items-center justify-between' : 'items-baseline')}>
        <Heading className='truncate'>Mutations in {lineage}</Heading>
        <button
          className={classNames(
            'text-subheading border border-transparent focus:primary-ring rounded',
            { 'h-6 px-1 mx-1.5 text-sm whitespace-nowrap': !isMobile }
          )}
          onClick={() => showMutationSearch(undefined)}
        >
          { isMobile
            ? <BsX className='h-7 w-7' />
            : 'Back to Lineages' }
        </button>
      </header>
      <ManageSelection
        muts={splitMuts}
        secondMut={secondMutMode}
        setSecondMut={setSecondMutMode}
        removeMutation={removeMutation}
      />
      <form className='mt-4 mb-1.5'>
        <div className='flex items-center space-x-1.5'>
          <Select responsive value={gene} onChange={e => setGene(e.target.value)}>
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
        filter={debouncedfilter}
        gene={gene}
        pangoClade={maybeFirstMut.pangoClade}
        queryParams={queryParams}
        selected={splitMuts}
        selectMutation={addMutation}
      />
    </>
  )
}

export default SearchMutations
