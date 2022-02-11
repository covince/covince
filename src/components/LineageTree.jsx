import React, { useCallback, useMemo, memo } from 'react'
import { BsX } from 'react-icons/bs'
import { HiChevronRight, HiChevronDown } from 'react-icons/hi'
import classNames from 'classnames'

import Button from './Button'
import Input from './TextInput'
import Checkbox from './Checkbox'
import LoadingOverlay from './LoadingOverlay'
import LineageMenu, { ColourPalette } from './LineageMenu'
import MutationForm from './MutationForm'
import useMutations from '../hooks/useMutations'

const LineageCheckbox = props => {
  const {
    checked,
    children,
    colour,
    disabled,
    id,
    label,
    menu,
    onChange
  } = props
  return (
    <span
      className={classNames('rounded py-1 pl-1.5 border border-transparent', { 'pr-1.5': checked })}
      style={checked ? { borderColor: colour } : null}
    >
      <span className='flex items-center space-x-2 h-5'>
        <Checkbox
          className='whitespace-nowrap'
          style={{ color: colour }}
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          title={disabled ? 'Limit reached - deselect other lineages first' : undefined}
        >
          {label}
        </Checkbox>
        { menu }
      </span>
      {children}
    </span>
  )
}
LineageCheckbox.displayName = 'LineageCheckbox'

const MutationsHelp = () => (
  <div className='p-3 text-xs tracking-wide space-y-1.5 w-48 flex flex-col justify-center'>
    {/* <h4 className='font-bold text-subheading'>Guidance</h4> */}
    <p>Add up to two mutations separated by a &ldquo;+&rdquo; character.</p>
    <p>Two mutations are considered a boolean AND.</p>
  </div>
)

const Branch = memo(({ node, ...props }) => {
  const {
    applyMutations,
    colourPalette,
    index,
    lineageToMutations,
    preset,
    removeMutations,
    search = '',
    selectDisabled,
    setColour,
    showMutationSearch,
    toggleOpen,
    toggleSelect,
    values
  } = props

  const {
    altName,
    lineage,
    sum,
    sumOfClade
  } = node
  const {
    isOpen = node.childIsSelected
  } = index[node.name] || {}

  const checked = lineage in values
  const colour = values[lineage] || null
  const isDisabled = selectDisabled && !checked
  const inSearch = search.length ? node.searchText.includes(search) : false

  const muts = lineageToMutations[lineage]
  const lineageWithMuts = `${lineage}+${muts}`
  const mutsChecked = lineageWithMuts in values
  const mutsInSearch = muts && search.length ? lineageWithMuts.toLowerCase().includes(search) : false
  const mutsColour = values[lineageWithMuts]

  let childBranches = []
  for (const child of node.children) {
    childBranches = childBranches.concat(
      <Branch
        key={child.name}
        node={child}
        {...props}
      />
    )
  }

  if (
    (search.length && !inSearch && !mutsInSearch) ||
    (preset === 'selected' && !checked && !mutsChecked)
  ) {
    return childBranches
  }

  const submitMutations = (value) => {
    if (value.length) {
      const cleanValue = value.split('+').slice(0, 2).map(_ => _.trim()).join('+')
      if (cleanValue !== muts) {
        applyMutations(lineage, cleanValue, muts ? lineageWithMuts : undefined)
      }
    }
  }

  const children = (
    <ul>
      {(preset === 'selected' ? mutsChecked : muts) &&
        <li className='flex mt-1.5 lg:ml-5 ml-7'>
          <LineageCheckbox
            checked={mutsChecked}
            colour={mutsColour}
            disabled={isDisabled}
            id={`lineage_selector_${lineageWithMuts}`}
            label={<span className='text-gray-700 dark:text-gray-100'>{lineage}+{muts}</span>}
            menu={
              <LineageMenu
                className='flex items-stretch divide-x divide-gray-100 dark:divide-gray-500'
              >
                <MutationForm
                  label="Edit mutation query"
                  initialValue={muts}
                  onSubmit={submitMutations}
                  onRemove={() => removeMutations(lineage, muts)}
                />
                { mutsChecked
                  ? <ColourPalette
                    colour={mutsColour}
                    lineage={lineageWithMuts}
                    palette={colourPalette}
                    setColour={setColour}
                  />
                  : <MutationsHelp /> }
              </LineageMenu>
            }
            onChange={() => toggleSelect(lineageWithMuts)}
          />
        </li> }
      { (isOpen || (preset === 'selected' && !checked)) &&
        <li>
          <ul className='lg:ml-6'>{childBranches}</ul>
        </li> }
    </ul>
  )

  if (
    (search.length && mutsInSearch && !inSearch) ||
    (preset === 'selected' && mutsChecked && !checked)
  ) {
    return children
  }

  const Chevron = isOpen ? HiChevronDown : HiChevronRight
  return (
    <li className='flex items-start mt-1.5'>
      <span className='mt-1 w-5 h-5 mr-2 text-gray-400 dark:text-gray-300' onClick={e => e.stopPropagation()}>
        { childBranches.length > 0 &&
          <Button className='!p-0' onClick={() => toggleOpen(node.name, isOpen)}>
            <Chevron className='w-5 h-5' />
          </Button> }
      </span>
      <LineageCheckbox
        checked={checked}
        colour={colour}
        disabled={isDisabled}
        id={`lineage_selector_${node.name}`}
        label={
          <>
            <span className={classNames('text-gray-700 dark:text-gray-100 lg:ml-0.5 leading-5')}>
              {lineage}
            </span>
            { altName &&
              <span className='ml-1 font-normal'>
                / {altName}
              </span> }
            { (!!sum || !!sumOfClade) &&
              <span className='ml-2 italic font-normal text-xs tracking-wide text-subheading dark:text-dark-subheading'>
                {!!sum && sum.toLocaleString()} {!!sumOfClade && `+ ${sumOfClade.toLocaleString()}`}
              </span> }
          </>
        }
        menu={
          (checked || !muts) &&
            <LineageMenu
              className='divide-y divide-gray-100 dark:divide-gray-500 text-right'
            >
              <ul className='my-1'>
                <li>
                  <button
                    className={`
                      text-xs font-bold text-right w-full px-3 py-1.5
                      border border-transparent
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      focus-visible:primary-ring
                    `}
                    onClick={() => showMutationSearch(lineage)}
                  >
                    Search mutations
                  </button>
                </li>
              </ul>
              {/* { !muts && <MutationForm label="Add mutation query" onSubmit={submitMutations} /> } */}
              { checked &&
                <ColourPalette
                  colour={colour}
                  lineage={lineage}
                  palette={colourPalette}
                  setColour={setColour}
                /> }
            </LineageMenu>
        }
        onChange={() => toggleSelect(lineage)}
      >
        { children }
      </LineageCheckbox>
    </li>
  )
})

Branch.displayName = 'Branch'

const LineageTree = (props) => {
  const {
    action,
    className,
    colourPalette,
    darkMode,
    lineageToColourIndex,
    maxLineages = colourPalette.length,
    numberSelected,
    showMutationSearch,
    submit,

    // external tree state
    search, setSearch, preset,
    scrollPosition, setScrollPosition,
    isLoading, nodeIndex, topology, toggleOpen
  } = props

  const { lineageToMutations, getMutationQueryUpdate } = useMutations()

  const inputRef = React.useRef()
  const scrollRef = React.useRef()
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
    if (scrollRef.current && scrollPosition) {
      scrollRef.current.scrollTo(scrollPosition)
    }
  }, [])

  React.useLayoutEffect(() => {
    const scrollingElement = scrollRef.current // cache for use in cleanup
    return () => setScrollPosition({
      top: scrollingElement.scrollTop,
      left: scrollingElement.scrollLeft
    })
  }, [scrollRef])

  const nextColourIndex = useMemo(() => {
    const colours = Object.values(lineageToColourIndex)
    const unique = new Set(colours)
    for (let i = 0; i < colourPalette.length; i++) {
      if (unique.has(i.toString())) continue
      return i.toString()
    }
    return colours.length % colourPalette.length
  }, [lineageToColourIndex])

  const toggleSelect = useCallback((lineage) => {
    const nextValues = { ...lineageToColourIndex }
    if (lineage in nextValues) {
      delete nextValues[lineage]
    } else {
      nextValues[lineage] = nextColourIndex
    }
    submit(nextValues)
  }, [lineageToColourIndex, colourPalette])

  const setColour = useCallback((lineage, colourIndex) => {
    const update = {
      ...lineageToColourIndex,
      [lineage]: colourIndex.toString()
    }
    submit(update)
  }, [lineageToColourIndex])

  const applyMutations = useCallback((lineage, muts, replacing) => {
    const mutationUpdate = getMutationQueryUpdate(lineage, muts)
    const lineageUpdate = { ...lineageToColourIndex }
    const newKey = `${lineage}+${muts}`
    if (replacing) {
      lineageUpdate[newKey] = lineageToColourIndex[replacing]
      delete lineageUpdate[replacing]
    } else {
      lineageUpdate[newKey] = nextColourIndex
    }
    submit(lineageUpdate, mutationUpdate)
  }, [getMutationQueryUpdate, lineageToColourIndex])

  const removeMutations = useCallback((lineage, muts) => {
    const mutationUpdate = getMutationQueryUpdate(lineage, muts, false)
    const lineageUpdate = { ...lineageToColourIndex }
    delete lineageUpdate[`${lineage}+${muts}`]
    submit(lineageUpdate, mutationUpdate)
  }, [getMutationQueryUpdate, lineageToColourIndex])

  const lightOrDarkPalette = useMemo(() =>
    colourPalette.map(item => item[darkMode ? 'dark' : 'light'])
  , [colourPalette, darkMode])

  const lineageToColour = useMemo(() => {
    return Object.fromEntries(
      Object.entries(lineageToColourIndex).map(
        ([lineage, colourIndex]) =>
          [lineage, lightOrDarkPalette[colourIndex]]
      )
    )
  }, [lineageToColourIndex, lightOrDarkPalette])

  return (
    <div className={classNames('flex flex-col', className)}>
      <form className='flex justify-between items-end space-x-3' onSubmit={e => { e.preventDefault() }}>
        <div className='flex items-center space-x-1'>
          <Input
            ref={inputRef}
            className='w-48'
            placeholder='Filter lineages'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          { search.length > 0 &&
            <button
              onClick={() => { setSearch(''); inputRef.current.focus() }}
              className='w-7 h-7 md:w-5 md:h-5 flex justify-center items-center rounded border border-transparent focus:primary-ring no-webkit-tap'
            >
              <BsX className='flex-shrink-0 w-7 h-7 md:w-5 md:h-5 text-gray-700 dark:text-gray-300' />
            </button> }
        </div>
        {action}
      </form>
      <LoadingOverlay
        className='flex-grow mt-2'
        loading={isLoading}
      >
        <ul ref={scrollRef} className='overflow-scroll gutterless-scrollbars absolute inset-0 pl-1 -mr-1.5'>
          {nodeIndex && topology.map(node =>
            <Branch
              applyMutations={applyMutations}
              colourPalette={lightOrDarkPalette}
              index={nodeIndex}
              key={node.name}
              lineageToMutations={lineageToMutations}
              node={node}
              preset={preset}
              removeMutations={removeMutations}
              search={search.toLowerCase()}
              selectDisabled={numberSelected >= maxLineages}
              setColour={setColour}
              showMutationSearch={showMutationSearch}
              toggleOpen={toggleOpen}
              toggleSelect={toggleSelect}
              values={lineageToColour}
            />
          )}
        </ul>
      </LoadingOverlay>
    </div>
  )
}

export default LineageTree
