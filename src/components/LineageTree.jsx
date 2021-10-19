import React, { useCallback, useMemo, memo } from 'react'
import { BsX } from 'react-icons/bs'
import { HiChevronRight, HiChevronDown, HiOutlineColorSwatch } from 'react-icons/hi'
import classNames from 'classnames'

import Button from './Button'
import Input from './TextInput'
import Checkbox from './Checkbox'
import LoadingOverlay from './LoadingOverlay'

import { colourPalette } from '../hooks/useDynamicLineages'

const Branch = memo(({ node, ...props }) => {
  const {
    cycleColour,
    index,
    preset,
    search = '',
    selectDisabled,
    toggleOpen,
    toggleSelect,
    values
  } = props

  const {
    label,
    altName,
    sum,
    sumOfClade
  } = node
  const {
    lineage = node.name,
    checked = (lineage in values),
    isOpen = node.childIsSelected
  } = index[node.name] || {}

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
    (search.length && !node.searchText.includes(search)) ||
    (preset === 'selected' && !checked)
  ) {
    return childBranches
  }

  const colour = values[lineage] || null
  const isDisabled = selectDisabled && !checked

  const Chevron = isOpen ? HiChevronDown : HiChevronRight
  return (
    <li className='flex items-start mt-1.5'>
      <span className='mt-1 w-5 h-5 mr-2 text-gray-400 dark:text-gray-300' onClick={e => e.stopPropagation()}>
        { childBranches.length > 0 &&
          <Button className='!p-0' onClick={() => toggleOpen(node.name, isOpen)}>
            <Chevron className='w-5 h-5' />
          </Button> }
      </span>
      <span
        className={classNames('rounded py-1 pl-1.5 border border-transparent', { 'pr-1.5': checked })}
        style={checked ? { borderColor: colour } : null}
      >
        <Checkbox
          className='whitespace-nowrap'
          style={{ color: colour }}
          id={`lineage_selector_${node.name}`}
          checked={checked}
          onChange={() => toggleSelect(lineage)}
          disabled={isDisabled}
          title={isDisabled ? 'Limit reached - deselect other lineages first' : undefined}
        >
          <span className={classNames('text-gray-700 dark:text-gray-100 lg:ml-0.5')}>
            {label}
          </span>
          { altName &&
            <span className='ml-1 font-normal'>
              / {altName}
            </span> }
            <span className='ml-2 italic font-normal text-xs tracking-wide text-subheading dark:text-dark-subheading'>
              {!!sum && sum.toLocaleString()} {!!sumOfClade && `+ ${sumOfClade.toLocaleString()}`}
            </span>
        </Checkbox>
        { isOpen &&
          <ul className='lg:ml-6'>
            {childBranches}
          </ul> }
      </span>
      { checked &&
        <button
          title='Change colour'
          className='mt-1 ml-1 lg:mr-0 focus:primary-ring rounded border border-transparent'
          onClick={e => cycleColour(lineage, e.shiftKey ? -1 : 1)}
        >
          <HiOutlineColorSwatch className='w-5 h-5' style={{ color: colour }} />
        </button> }
    </li>
  )
})

const LineageTree = (props) => {
  const {
    action,
    className,
    darkMode,
    lineageToColourIndex,
    maxLineages = colourPalette.length,
    numberSelected,
    submit,

    // external tree state
    search, setSearch, preset,
    scrollPosition, setScrollPosition,
    isLoading, nodeIndex, topology, toggleOpen
  } = props

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

  const toggleSelect = useCallback((nodeName) => {
    const nextValues = { ...lineageToColourIndex }
    if (nodeName in nextValues) {
      delete nextValues[nodeName]
    } else {
      nextValues[nodeName] = nextColourIndex
    }
    submit(nextValues)
  }, [lineageToColourIndex])

  const cycleColour = useCallback((nodeName, direction = 1) => {
    let nextValue = parseInt(lineageToColourIndex[nodeName]) + direction
    if (nextValue < 0) nextValue = colourPalette.length - 1
    else if (nextValue >= colourPalette.length) nextValue = 0
    submit({
      ...lineageToColourIndex,
      [nodeName]: nextValue
    })
  }, [lineageToColourIndex])

  const lineageToColour = useMemo(() => {
    return Object.fromEntries(
      Object.entries(lineageToColourIndex).map(
        ([lineage, colourIndex]) =>
          [lineage, colourPalette[colourIndex][darkMode ? 'dark' : 'light']]
      )
    )
  }, [lineageToColourIndex, darkMode])

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
              cycleColour={cycleColour}
              index={nodeIndex}
              key={node.name}
              node={node}
              preset={preset}
              search={search.toLowerCase()}
              selectDisabled={numberSelected >= maxLineages}
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
