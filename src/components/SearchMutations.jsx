import React, { useState, useMemo } from 'react'
import classNames from 'classnames'
import { BsX, BsChevronDoubleDown, BsPlus } from 'react-icons/bs'
import { Popover, Transition } from '@headlessui/react'

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

const ManageSelection = ({ muts, mode = 'single', addingMut, setAddingMut, removeMutation }) => {
  let content
  if (muts.length === 0) {
    content =
      <p className='text-subheading italic text-sm flex items-center h-10 border border-gray-200 dark:border-gray-500 rounded px-3'>
        (none selected)
      </p>
  } else if (mode === 'multi') {
    content = (
      <div className='flex xl:flex-row-reverse items-center self-center space-x-2 xl:gap-2'>
        <Popover as='div' className='relative'>
          <Popover.Button
            as={Button}
            className='inline-flex items-center justify-center px-3 h-10 whitespace-nowrap'
          >
            {muts.length} mutation{muts.length === 1 ? '' : 's'}
            <BsChevronDoubleDown className='ml-2 h-4 w-4' />
          </Popover.Button>
          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Popover.Panel
              className={`
                absolute z-20 top-full left-0 xl:left-auto xl:right-0 mt-2 origin-top-left xl:origin-top-right font-medium py-1
                bg-white rounded shadow-md ring-1 ring-black ring-opacity-5
                focus:outline-none dark:bg-gray-600 dark:text-white dark:ring-gray-500
              `}
              as='ul'
            >
              {muts.map((mut, idx) =>
                <li
                  key={mut}
                  className={classNames(
                    'py-1.5 pl-3 md:pl-4 pr-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700',
                    { 'border-t-2 border-dotted border-gray-300 dark:border-gray-400': !addingMut && muts.length > 1 && idx === muts.length - 1 }
                  )}
                >
                  <span className='mr-3'>{mut}</span>
                  <button
                    className={`
                    text-subheading ml-auto rounded border border-transparent
                      active:primary-ring active:bg-white dark:active:bg-gray-600
                      focus:outline-none focus-visible:primary-ring
                    `}
                    title='Remove mutation'
                    onClick={() => removeMutation(idx)}
                  >
                    <BsX className='h-5 w-5' />
                  </button>
                </li>
              )}
            </Popover.Panel>
          </Transition>
        </Popover>
        <Button
          className='pl-3 pr-1.5 self-center flex items-center h-10'
          onClick={() => setAddingMut(!addingMut)}
          title={addingMut ? 'Cancel next mutation' : 'Add next mutation'}
        >
          <span className='pr-0.5'>{ addingMut ? 'cancel' : 'Add' }</span>
          { addingMut
            ? <BsX className='w-5 h-5 opacity-70' />
            : <BsPlus className='w-5 h-5' /> }
        </Button>
      </div>
    )
  } else {
    content = (
      <div className='border border-gray-200 dark:border-gray-500 rounded p-1.5'>
        <span className='px-1.5 mr-1.5'>{muts[0]}</span>
        <Button
          className='py-0.5 px-1.5 self-center'
          onClick={removeMutation}
          title='Remove mutation'
        >
          remove
        </Button>
      </div>
    )
  }

  return (
    <section
      className='flex items-center max-w-max text-sm leading-6'
    >
      <h3 className='text-subheading font-bold uppercase text-xs tracking-wider leading-6 sr-only'>
        Selected:
      </h3>
      {content}
    </section>
  )
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

  const [addingMut, setAddingMut] = useState()

  const pangoCladeForApi = useMemo(() =>
    splitMuts.length > 0 && addingMut
      ? `${pangoClade}+${currentMuts}`
      : [pangoClade, ...splitMuts.slice(0, -1)].join('+')
  , [lineage, addingMut, currentMuts])

  const selectedLineages = useMemo(() => Object.keys(lineageToColourIndex).concat(lineage), [lineageToColourIndex])
  const { unaliasedToAliased, expandedLineages, topology, denominatorLineages } = useLineagesForAPI(selectedLineages)
  const excludedLineages = useMemo(() =>
    getExcludedLineages(expandedLineages, topology, pangoClade).filter(l => !(l.startsWith(`${pangoClade}+`)))
  , [selectedLineages])
  const lineagesForApi = useMemo(() => Array.from(new Set([
    ...denominatorLineages,
    ...excludedLineages,
    pangoCladeForApi
  ])), [selectedLineages, pangoCladeForApi])

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
    setAddingMut(false)
  }, [getMutationQueryUpdate, lineageToColourIndex])

  const removeMutation = React.useCallback((idx = splitMuts.length - 1) => {
    const nextMuts = [...splitMuts]
    nextMuts.splice(idx, 1)
    applyMutations(nextMuts.join('+'))
  }, [currentMuts])

  const selectMutation = React.useCallback((mut) => {
    if (splitMuts.includes(mut)) {
      applyMutations(splitMuts.filter(m => m !== mut).join('+'))
    } else {
      applyMutations([
        ...(addingMut ? splitMuts : splitMuts.slice(0, -1)),
        mut
      ].join('+'))
    }
  }, [currentMuts, addingMut])

  const [{ gene = '', mutationFilter = '' }, updateQuery] = useQueryAsState()
  const debouncedfilter = useDebouncedValue(mutationFilter, 250)

  const excludedLineageString = useMemo(() => {
    return excludedLineages.map(l => unaliasedToAliased[l]).join(', ')
  }, [excludedLineages])

  const excludedTitle = useMemo(() => {
    return excludedLineages.length > 1 || excludedLineageString.includes('+') ? excludedLineageString : null
  }, [excludedLineages])

  return (
    <>
      <header className='md:flex items-baseline md:h-6 pl-3 md:pl-0 pr-11 md:pr-9 lg:pr-0 relative'>
        <Heading className='truncate flex-shrink-0'>
          Mutations in {lineage}
        </Heading>
        { excludedLineages.length > 0 &&
          <p className={classNames('text-sm text-subheading truncate mr-1.5 md:ml-2', { 'cursor-help': excludedTitle })} title={excludedTitle}>
            excluding { excludedLineages.length === 1 ? excludedLineageString : `${excludedLineages.length} sublineages` }
          </p> }
        <button
          className='!p-0 absolute border border-transparent focus:primary-ring rounded -top-0.5 right-2 md:right-0'
          onClick={onClose}
          title='Back to Lineages'
        >
          <BsX className='h-7 w-7' />
        </button>
        {/* { isLarge
          ? <Button className='h-6 px-2 ml-auto flex items-center whitespace-nowrap' onClick={onClose}>
              Back to Lineages
            </Button>
          : <button
              className='!p-0 absolute border border-transparent focus:primary-ring rounded -top-0.5 right-2 md:right-0'
              onClick={onClose}
              title='Back to Lineages'
            >
              <BsX className='h-7 w-7' />
            </button> } */}
      </header>
      <div className='px-3 md:px-0 mt-3 mb-1.5 space-y-3 xl:space-y-0 xl:flex flex-row-reverse items-center xl:justify-between'>
        <ManageSelection
          muts={splitMuts}
          mode={props.mutationMode}
          addingMut={addingMut}
          setAddingMut={setAddingMut}
          removeMutation={removeMutation}
        />
        <form className='lg:mr-3' onSubmit={e => e.preventDefault()}>
          <div className='flex items-center space-x-1.5'>
            <Select responsive value={gene} onChange={e => updateQuery({ gene: e.target.value })} className='!flex-shrink-0'>
              <option value=''>(gene)</option>
              {genes.map(g => <option key={g} value={g}>{g}</option>)}
            </Select>
            <p>:</p>
            <Input
              onChange={e => updateQuery({ mutationFilter: e.target.value.toUpperCase() }, 'replace')}
              placeholder='filter mutations'
              value={mutationFilter}
              className='flex-shrink'
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
        pangoClade={pangoCladeForApi}
        queryParams={queryParams}
        selected={splitMuts}
        selectMutation={selectMutation}
      />
    </>
  )
}

export default SearchMutations
