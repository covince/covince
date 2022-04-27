import React, { useCallback, useMemo, memo } from 'react'
import { BsX } from 'react-icons/bs'
import { HiChevronRight, HiChevronDown } from 'react-icons/hi'
import classNames from 'classnames'

import Button from './Button'
import Input from './TextInput'
import Checkbox from './Checkbox'
import LoadingOverlay from './LoadingOverlay'
import LineageMenu, { ColourPalette } from './LineageMenu'

export const LineageCheckbox = props => {
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

const DefaultMenu = props => {
  const {
    colour,
    palette,
    enabled,
    lineage,
    setColour
  } = props

  if (enabled) {
    return (
      <LineageMenu>
        <ColourPalette
          colour={colour}
          lineage={lineage}
          palette={palette}
          setColour={setColour}
        />
      </LineageMenu>
    )
  }

  return null
}

export const LineageTreeBranch = memo(({ node, ...props }) => {
  const {
    checked,
    colour,
    colourPalette,
    children,
    hasChildren,
    isDisabled,
    isOpen,
    Menu = DefaultMenu,
    renderChildren,
    setColour,
    toggleOpen,
    toggleSelect
  } = props

  const {
    altName,
    lineage,
    sum,
    sumOfClade
  } = node

  const Chevron = isOpen ? HiChevronDown : HiChevronRight
  return (
    <li className='flex items-start mt-1.5'>
      <span className='mt-1 w-5 h-5 mr-2 text-gray-400 dark:text-gray-300' onClick={e => e.stopPropagation()}>
        { hasChildren &&
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
              <span className='ml-2 italic font-normal text-xs tracking-wide text-subheading'>
                {!!sum && sum.toLocaleString()} {!!sumOfClade && `+ ${sumOfClade.toLocaleString()}`}
              </span> }
          </>
        }
        menu={
          <Menu
            enabled={checked}
            colour={colour}
            lineage={lineage}
            palette={colourPalette}
            setColour={setColour}
          />
        }
        onChange={() => toggleSelect(lineage)}
      >
        {renderChildren ? renderChildren() : children}
      </LineageCheckbox>
    </li>
  )
})

LineageTreeBranch.displayName = 'LineageTreeBranch'

export const useBranch = (props) => {
  const { node, index, preset, selectDisabled, search = '', values } = props
  const { lineage } = node
  const { isOpen = node.childIsSelected } = index[node.name] || {}

  const checked = node.lineage in values
  const colour = values[lineage] || null
  const isDisabled = selectDisabled && !checked
  const inSearch = search.length ? node.searchText.includes(search) : false

  return {
    checked,
    colour,
    isDisabled,
    isOpen,
    inSearch,
    skipNode: (search.length && !inSearch) || (preset === 'selected' && !checked)
  }
}

const DefaultBranch = props => {
  const { node } = props

  let childBranches = []
  for (const child of node.children) {
    childBranches = childBranches.concat(
      <DefaultBranch
        key={child.name}
        {...props}
        node={child}
      />
    )
  }

  const branch = useBranch(props)
  const { skipNode, isOpen } = branch

  if (skipNode) {
    return childBranches
  }

  return (
    <LineageTreeBranch
      {...props}
      {...branch}
      hasChildren={childBranches.length > 0}
    >
      {isOpen ? <ul className='lg:ml-6'>{childBranches}</ul> : null}
    </LineageTreeBranch>
  )
}

const LineageTree = (props) => {
  const {
    action,
    Branch = DefaultBranch,
    branchProps,
    className,
    colourPalette,
    darkMode,
    header,
    lineageToColourIndex,
    maxLineages = colourPalette.length,
    nextColourIndex,
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
    <>
      {header}
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
                Branch={Branch}
                colourPalette={lightOrDarkPalette}
                index={nodeIndex}
                key={node.name}
                node={node}
                preset={preset}
                search={search.toLowerCase()}
                selectDisabled={numberSelected >= maxLineages}
                setColour={setColour}
                toggleOpen={toggleOpen}
                toggleSelect={toggleSelect}
                values={lineageToColour}
                {...branchProps}
              />
            )}
          </ul>
        </LoadingOverlay>
      </div>
    </>
  )
}

export default LineageTree
