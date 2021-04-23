import React, { useMemo } from 'react'

import Checkbox from './Checkbox'
import { DescriptiveHeading } from './Typography'

const LineageFilter = ({ className, toggleLineage, activeLineages, allSelected, toggleAll }) => {
  const formStyle = useMemo(() => {
    const numLineages = Object.keys(activeLineages).length
    const numColumns = Math.max(2, Math.min(Math.ceil(numLineages / 2), 5))
    return { gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` }
  }, [activeLineages])

  return (
    <div className={className}>
      <header className='flex justify-between space-x-6'>
        <DescriptiveHeading>Lineages</DescriptiveHeading>
        <div className='flex items-center'>
          <label
            htmlFor='lineage_toggle_all'
            className='pr-2 text-primary text-xs uppercase tracking-wide font-bold leading-5'
          >
            toggle all
          </label>
          <Checkbox
            className='text-xs text-primary mx-auto flex-row-reverse'
            id='lineage_toggle_all'
            checked={allSelected}
            onChange={toggleAll}
          />
        </div>
      </header>
      <form
        className='flex-grow flex flex-wrap md:grid grid-flow-row overflow-y-auto -mx-4 md:-mx-2'
        style={formStyle}
      >
        {Object.keys(activeLineages)
          .map(lineage => {
            const { active, colour } = activeLineages[lineage]
            return (
              <Checkbox
                key={lineage}
                className='mx-4 md:mx-2 h-8 md:h-7'
                style={{ color: colour }}
                id={`lineage_filter_${lineage}`}
                label={lineage}
                checked={active}
                onChange={() => toggleLineage(lineage)}
              />
            )
          })}
      </form>
    </div>
  )
}

export default LineageFilter
