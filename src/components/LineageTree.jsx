import React, { useCallback, useMemo, memo } from 'react'
import { BsX } from 'react-icons/bs'
import { HiChevronRight, HiChevronDown, HiPlus } from 'react-icons/hi'
import classNames from 'classnames'

import Button from './Button'
import Input from './TextInput'
import Checkbox from './Checkbox'
import LoadingOverlay from './LoadingOverlay'
import LineageMenu, { ColourPalette } from './LineageMenu'
import MutationForm from './MutationForm'

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

const Branch = memo(({ node, ...props }) => {
  const {
    colourPalette,
    index,
    preset,
    search = '',
    selectDisabled,
    setColour,
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

  const lineageWithMuts = Object.keys(values).find(k => k.startsWith(`${lineage}+`))
  const mutsColour = values[lineageWithMuts]
  const isolatedMuts = lineageWithMuts ? lineageWithMuts.slice(lineageWithMuts.indexOf('+') + 1) : ''

  const submitMutations = (value) => {
    if (value.length) {
      const muts = value.split('+').slice(0, 2).map(_ => _.trim()).join('+')
      toggleSelect(lineageWithMuts, `${lineage}+${muts}`)
    }
  }

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
          checked &&
          <LineageMenu>
            <ColourPalette
              colour={colour}
              lineage={lineage}
              palette={colourPalette}
              setColour={setColour}
            />
          </LineageMenu>
        }
        onChange={() => toggleSelect(lineage, lineageWithMuts)}
      >
        <ul>
          { checked &&
            <li className='ml-7 lg:ml-5 flex mt-1.5'>
              { lineageWithMuts
                ? <LineageCheckbox
                    checked={!!lineageWithMuts}
                    colour={mutsColour}
                    disabled={isDisabled}
                    id={`lineage_selector_${lineageWithMuts}`}
                    label={
                      <>
                        <span className='font-normal'>+</span>
                        <span className={classNames('text-gray-700 dark:text-gray-100 lg:ml-0.5 leading-5')}>
                          {isolatedMuts}
                        </span>
                      </>
                    }
                    menu={
                      !!lineageWithMuts &&
                      <LineageMenu
                        className='flex items-start divide-x divide-gray-100 dark:divide-gray-500'
                      >
                        <MutationForm initialValue={isolatedMuts} onSubmit={submitMutations} />
                        <ColourPalette
                          colour={mutsColour}
                          lineage={lineageWithMuts}
                          palette={colourPalette}
                          setColour={setColour}
                        />
                      </LineageMenu>
                    }
                    onChange={() => toggleSelect(lineageWithMuts)}
                  />
                : <LineageMenu
                    className='flex items-stretch divide-x divide-gray-100 dark:divide-gray-500'
                    buttonLabel={
                      <span className='text-xs tracking-wide text-subheading flex items-center'>
                        <span className='pl-0.5'>add mutations</span>
                        <HiPlus className='h-5 w-5 ml-0.5 -mr-0.5 text-gray-500 dark:text-gray-400'/>
                      </span>
                    }
                  >
                    <MutationForm onSubmit={submitMutations} />
                    {/* <div className='p-3 text-xs tracking-wide space-y-1.5'>
                      <h4 className='font-bold text-subheading'>Guidance</h4>
                      <p>Lorem ipsum</p>
                    </div> */}
                  </LineageMenu> }
            </li> }
          { isOpen &&
            <li>
              <ul className='lg:ml-6'>{childBranches}</ul>
            </li> }
        </ul>
      </LineageCheckbox>
    </li>
  )
})

Branch.displayName = 'Branch'

const getNextColour = (colours, palette) => {
  const unique = new Set(colours)
  for (let i = 0; i < palette.length; i++) {
    if (unique.has(i.toString())) continue
    return i.toString()
  }
  return colours.length % palette.length
}

const LineageTree = (props) => {
  const {
    action,
    className,
    colourPalette,
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

  const toggleSelect = useCallback((...lineages) => {
    const nextValues = { ...lineageToColourIndex }
    for (const l of lineages) {
      if (typeof l !== 'string' || l.length === 0) continue
      if (l in nextValues) {
        delete nextValues[l]
      } else {
        nextValues[l] = getNextColour(Object.values(nextValues), colourPalette)
      }
    }
    submit(nextValues)
  }, [lineageToColourIndex])

  const setColour = useCallback((lineage, colourIndex) => {
    submit({
      ...lineageToColourIndex,
      [lineage]: colourIndex
    })
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
            />
          )}
        </ul>
      </LoadingOverlay>
    </div>
  )
}

export default LineageTree
