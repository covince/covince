import React, { useState, useMemo } from 'react'
import classNames from 'classnames'
import { BsPlus, BsX, BsDash as RemoveIcon } from 'react-icons/bs'

import Select from './Select'
import Input from './TextInput'
import { Heading } from './Typography'
import MutationsList from './MutationsList'
import Button from './Button'

import useMutations from '../hooks/useMutations'
import useDebouncedValue from '../hooks/useDebouncedValue'
import useQueryAsState from '../hooks/useQueryAsState'
import { useLineagesForAPI, getExcludedLineages } from '../hooks/useDynamicAPI'
import { useScreen } from '../hooks/useMediaQuery'

import { expandLineage } from '../pango'

const ManageSelection = ({ muts, secondMut, setSecondMut, removeMutation }) => (
  <section
    className={`
      flex items-baseline space-x-2 max-w-max text-sm leading-6 h-10
      mt-3 p-1.5 rounded border border-gray-200 dark:border-gray-500
    `}
  >
    <h3 className='text-subheading font-bold uppercase text-xs tracking-wider ml-1.5 leading-6 hidden md:block'>
      Selected:
    </h3>
    { muts.length === 0
      ? <p className='text-subheading pr-1.5'>none</p>
      : <>
          <span>{muts[0]}</span>
          { secondMut
            ? <BsPlus className='text-subheading h-5 w-5 self-center' />
            : <Button
                className='py-0.5 px-1 self-center'
                onClick={removeMutation}
                title='Remove mutation'
              >
                <RemoveIcon className='w-5 h-5' />
              </Button> }
          { muts[1]
            ? <>
                <span>{muts[1]}</span>
                <Button
                  className='py-0.5 px-1 self-center'
                  onClick={removeMutation}
                  title='Remove mutation'
                >
                  <RemoveIcon className='w-5 h-5' />
                </Button>
              </>
            : <Button className='py-0.5 px-2 whitespace-nowrap -mr-3 self-center' onClick={() => setSecondMut(!secondMut)}>
                { secondMut ? 'cancel' : 'Add' } 2nd mut.
              </Button> }
        </> }
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
    lineageToColourIndex,
    nextColourIndex,
    onClose,
    queryParams,
    submit
  } = props

  const isLarge = useScreen('lg')

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

  const selectedLineages = useMemo(() => Object.keys(lineageToColourIndex).concat(lineage), [lineageToColourIndex])
  const { unaliasedToAliased, expandedLineages, topology, denominatorLineages } = useLineagesForAPI(selectedLineages)
  const excludedLineages = useMemo(() => getExcludedLineages(expandedLineages, topology, pangoClade), [selectedLineages])
  const lineagesForApi = useMemo(() => Array.from(new Set([
    ...denominatorLineages,
    ...excludedLineages.filter(l => !(l.startsWith(`${pangoClade}+`))),
    // pangoClade,
    maybeFirstMut.pangoClade
  ])), [selectedLineages, maybeFirstMut])

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
    // setSecondMutMode(false)
  }, [currentMuts])

  const selectMutation = React.useCallback((mut) => {
    if (splitMuts.includes(mut)) {
      applyMutations(splitMuts.filter(m => m !== mut).join('+'))
    } else {
      const nextMuts = getNextMuts(splitMuts, mut, secondMutMode)
      applyMutations(nextMuts)
    }
  }, [currentMuts, secondMutMode])

  const [{ gene = '', mutationFilter = '' }, updateQuery] = useQueryAsState()
  const debouncedfilter = useDebouncedValue(mutationFilter, 250)

  const displayExcluded = useMemo(() => {
    return excludedLineages.filter(l => !(l.startsWith(`${pangoClade}+`)))
  }, [excludedLineages])

  const excludedLineageString = useMemo(() => {
    return displayExcluded.map(l => unaliasedToAliased[l]).join(', ')
  }, [displayExcluded])

  const excludedTitle = useMemo(() => {
    return displayExcluded.length > 1 || excludedLineageString.includes('+') ? excludedLineageString : null
  }, [displayExcluded])

  return (
    <>
      <header className='md:flex items-baseline md:h-6 pl-3 md:pl-0 pr-11 md:pr-9 lg:pr-0 relative'>
        <Heading className='truncate flex-shrink-0'>
          Mutations in {lineage}
        </Heading>
        { displayExcluded.length > 0 &&
          <p className={classNames('text-sm text-subheading truncate mr-1.5 md:ml-2', { 'cursor-help': excludedTitle })} title={excludedTitle}>
            excluding { displayExcluded.length === 1 ? excludedLineageString : `${displayExcluded.length} sublineages` }
          </p> }
        { isLarge
          ? <Button className='h-6 px-2 ml-auto flex items-center whitespace-nowrap' onClick={onClose}>
              Back to Lineages
            </Button>
          : <button
              className='!p-0 absolute border border-transparent focus:primary-ring rounded -top-0.5 right-2 md:right-0'
              onClick={onClose}
            >
              <BsX className='h-7 w-7' />
            </button> }
      </header>
      <div className='px-3 md:px-0 big:flex flex-row-reverse justify-end'>
        <ManageSelection
          muts={splitMuts}
          secondMut={secondMutMode}
          setSecondMut={setSecondMutMode}
          removeMutation={removeMutation}
        />
        <form className='mt-3 mb-1.5 big:mr-3' onSubmit={e => e.preventDefault()}>
          <div className='flex items-center space-x-1.5'>
            <Select responsive value={gene} onChange={e => updateQuery({ gene: e.target.value })}>
              <option value=''>(gene)</option>
              {genes.map(g => <option key={g} value={g}>{g}</option>)}
            </Select>
            <p>:</p>
            <Input
              onChange={e => updateQuery({ mutationFilter: e.target.value.toUpperCase() }, 'replace')}
              placeholder='filter mutations'
              value={mutationFilter}
            />
            { (gene || mutationFilter) &&
              <button
                className='rounded border border-transparent focus:primary-ring text-subheading'
                title='Reset filter'
                onClick={() => updateQuery({ gene: undefined, mutationFilter: undefined })}
              >
                <BsX className='h-5 w-5' />
              </button> }
          </div>
        </form>
      </div>
      <MutationsList
        api_url={api_url}
        dates={props.dates}
        filter={debouncedfilter}
        gene={gene}
        isLarge={isLarge}
        lineagesForApi={lineagesForApi}
        pangoClade={maybeFirstMut.pangoClade}
        queryParams={queryParams}
        selected={splitMuts}
        selectMutation={selectMutation}
      />
    </>
  )
}

export default SearchMutations
