import React, { useCallback, memo } from 'react'

import LineageMenu, { MenuItems, MenuItem, ColourPalette } from './LineageMenu'
import LineageTree, { LineageCheckbox, LineageTreeBranch, useBranch } from './LineageTree'
import SearchMutations from './SearchMutations'

import useMutations from '../hooks/useMutations'
import useQueryAsState from '../hooks/useQueryAsState'
import { useInfo } from '../hooks/useDynamicInfo'

const Branch = memo(props => {
  const {
    colourPalette,
    lineageToMutations,
    node,
    preset,
    removeMutations,
    search = '',
    setColour,
    showMutationSearch,
    toggleSelect,
    values
  } = props

  const { lineage } = node

  const muts = lineageToMutations[lineage] || ''
  const lineageWithMuts = `${lineage}+${muts}`
  const mutsChecked = lineageWithMuts in values
  const mutsInSearch = muts && search.length ? lineageWithMuts.toLowerCase().includes(search) : false
  const mutsColour = values[lineageWithMuts]
  const splitMuts = muts.split('+')

  let childBranches = []
  for (const child of node.children) {
    childBranches = childBranches.concat(
      <Branch
        key={child.name}
        {...props}
        node={child}
      />
    )
  }

  const branch = useBranch(props)
  const { checked, isDisabled, skipNode, isOpen } = branch

  if (skipNode && (
    (search.length && !mutsInSearch) || (preset === 'selected' && !mutsChecked)
  )) {
    return childBranches
  }

  const renderChildren = () => (
    <ul>
      {(preset === 'selected' ? mutsChecked : muts) &&
        <li className='flex mt-1.5 lg:ml-5 ml-7'>
          <LineageCheckbox
            checked={mutsChecked}
            colour={mutsColour}
            disabled={isDisabled}
            id={`lineage_selector_${lineageWithMuts}`}
            label={
              <span className='text-gray-700 dark:text-gray-100 leading-5'>
                {lineage}<span className='text-xs tracking-wide pl-1' title={splitMuts.join(', ')}>+ {splitMuts.length === 1 ? muts : `${splitMuts.length} muts.`}</span>
              </span>}
            menu={
              <LineageMenu>
                <MenuItems>
                  <MenuItem onClick={() => showMutationSearch(lineage)}>
                    Edit
                  </MenuItem>
                </MenuItems>
                { mutsChecked &&
                  <ColourPalette
                    colour={mutsColour}
                    lineage={lineageWithMuts}
                    palette={colourPalette}
                    setColour={setColour}
                  /> }
                <MenuItems>
                  <MenuItem onClick={() => removeMutations(lineage, muts)}>
                    Remove
                  </MenuItem>
                </MenuItems>
              </LineageMenu>
            }
            onChange={() => toggleSelect(lineageWithMuts)}
          />
        </li>}
      {(isOpen || (preset === 'selected' && !checked)) &&
        <li>
          <ul className='lg:ml-6'>{childBranches}</ul>
        </li>}
    </ul>
  )

  if (
    skipNode && (
      (search.length && mutsInSearch) ||
      (preset === 'selected' && mutsChecked)
    )
  ) {
    return renderChildren()
  }

  const Menu = useCallback(({ colour, palette, lineage, setColour }) => (
    <LineageMenu>
      <MenuItems>
        <MenuItem onClick={() => showMutationSearch(lineage)}>
          View mutations
        </MenuItem>
      </MenuItems>
      { checked &&
        <ColourPalette
          colour={colour}
          lineage={lineage}
          palette={palette}
          setColour={setColour}
        /> }
    </LineageMenu>
  ), [checked])

  return (
    <LineageTreeBranch
      {...props}
      {...branch}
      Menu={Menu}
      hasChildren={childBranches.length > 0}
      renderChildren={renderChildren}
    />
  )
})

Branch.displayName = 'Branch'

const LineageTreeWithMutations = (props) => {
  const { lineageToColourIndex, submit } = props

  const { lineageToMutations, getMutationQueryUpdate } = useMutations()

  const [{ lineageView }, updateQuery] = useQueryAsState({ lineageView: null })
  const showMutationSearch = React.useCallback((lineage = '1') => updateQuery({ lineageView: lineage }), [])
  const searchingMutations = React.useMemo(() => lineageView === '1' ? undefined : lineageView, [lineageView])

  const removeMutations = useCallback((lineage, muts) => {
    const mutationUpdate = getMutationQueryUpdate(lineage, muts, false)
    const lineageUpdate = { ...lineageToColourIndex }
    delete lineageUpdate[`${lineage}+${muts}`]
    submit(lineageUpdate, mutationUpdate)
  }, [getMutationQueryUpdate, lineageToColourIndex])

  const branchProps = React.useMemo(() => ({
    lineageToMutations,
    removeMutations,
    showMutationSearch
  }), [lineageToMutations, removeMutations])

  const info = useInfo()

  if (searchingMutations) {
    return (
      <SearchMutations
        {...props}
        genes={info.genes}
        dates={info.dates}
        lineage={searchingMutations}
        lineageToColourIndex={lineageToColourIndex}
        onClose={() => showMutationSearch(undefined)}
        submit={submit}
        showMutationSearch={showMutationSearch}
      />
    )
  }

  return (
    <LineageTree
      {...props}
      Branch={Branch}
      branchProps={branchProps}
    />
  )
}

export default LineageTreeWithMutations
