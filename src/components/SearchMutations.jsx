import React, { useState, useMemo } from 'react'
import classNames from 'classnames'
import { BsX, BsCaretDownFill } from 'react-icons/bs'
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
  if (mode === 'multi') {
    const buttonRef = React.useRef()
    content = (
      <>
        <Popover>
          {({ open }) => (
            <>
              <Popover.Button
                ref={buttonRef}
                className={`
                  inline-flex items-center justify-center px-3
                  border-2 border-solid border-transparent transition-colors
                  hover:border-gray-400 hover:border-opacity-70 focus:outline-none focus:border-gray-400
                  rounded-full font-bold
                `}
              >
                {muts.length} mutation{muts.length === 1 ? '' : 's'}
                <BsCaretDownFill className='ml-2 h-3.5 w-3.5' />
              </Popover.Button>
              <Transition
                show={open}
                as={React.Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Popover.Panel
                  static
                  focus
                  className={`
                    absolute z-20 top-full _left-0 mt-2 origin-top-left font-medium
                    bg-white rounded shadow-xl ring-1 ring-black ring-opacity-5
                    focus:outline-none dark:bg-gray-600 dark:text-white dark:ring-gray-500
                  `}
                  as='ul'
                >
                  {muts.map((mut, idx) =>
                    <li
                      key={mut}
                      className='p-2 pl-4 flex items-center'
                      onClick={() => buttonRef.current.focus()}
                    >
                      {mut}
                      <button
                        className='rounded border border-transparent focus:primary-ring text-subheading ml-1.5'
                        title='Remove mutation'
                        onClick={() => removeMutation(mut)}
                      >
                        <BsX className='h-5 w-5' />
                      </button>
                    </li>
                  )}
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
        <Button
          className='py-0.5 px-1.5 whitespace-nowrap -mr-3 self-center'
          onClick={() => setAddingMut(!addingMut)}
          title={addingMut ? 'Cancel next mutation' : 'Add next mutation'}
        >
          {/* <BsPlus className='w-5 h-5 fill-current' /> */}
          { addingMut ? 'cancel' : 'Add' } next mut.
        </Button>
      </>
    )
  } else if (muts.length === 0) {
    content = <p className='text-subheading pr-1.5'>none</p>
  } else {
    content = (
      <>
        <span>{muts[0]}</span>
        <Button
          className='py-0.5 px-1.5 self-center'
          onClick={removeMutation}
          title='Remove mutation'
        >
          remove
        </Button>
      </>
    )
  }

  return (
    <section
      className={`
        flex items-baseline space-x-2 max-w-max text-sm leading-6 h-10
        mt-3 p-1.5 rounded border border-gray-200 dark:border-gray-500
        relative
      `}
    >
      <h3 className='text-subheading font-bold uppercase text-xs tracking-wider ml-1.5 leading-6 hidden md:block'>
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

  const removeMutation = React.useCallback(() => {
    applyMutations(splitMuts.slice(0, -1).join('+'))
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
        { isLarge
          ? <Button className='h-6 px-2 ml-auto flex items-center whitespace-nowrap' onClick={onClose}>
              Back to Lineages
            </Button>
          : <button
              className='!p-0 absolute border border-transparent focus:primary-ring rounded -top-0.5 right-2 md:right-0'
              onClick={onClose}
              title='Back to Lineages'
            >
              <BsX className='h-7 w-7' />
            </button> }
      </header>
      <div className='px-3 md:px-0 big:flex flex-row-reverse justify-end'>
        <ManageSelection
          muts={splitMuts}
          mode={props.mutationMode}
          addingMut={addingMut}
          setAddingMut={setAddingMut}
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
        pangoClade={pangoCladeForApi}
        queryParams={queryParams}
        selected={splitMuts}
        selectMutation={selectMutation}
      />
    </>
  )
}

export default SearchMutations
