import React, { useMemo } from 'react'
import classNames from 'classnames'

import Checkbox from './Checkbox'
import { DescriptiveHeading } from './Typography'

const LineageFilter = ({ className, toggleLineage, sortedLineages, allSelected, toggleAll }) => {
  const formStyle = useMemo(() => {
    const numLineages = sortedLineages.length
    const numColumns = Math.max(2, Math.min(Math.ceil(numLineages / 2), 5))
    return { gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` }
  }, [sortedLineages])

  return (
    <div className={className}>
      <header className='flex justify-between space-x-6 md:-mb-0.5'>
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
        className='flex-grow flex flex-wrap md:grid grid-flow-row md:content-center md:gap-0.5 overflow-y-auto md:-mx-2'
        style={formStyle}
      >
        {sortedLineages
          .map(({ lineage, active, colour, altName }) => {
            return (
              <Checkbox
                key={lineage}
                className='w-1/3 my-1 md:my-0 md:mx-2' // add md:h-7 here to cancel auto alignment
                style={{ color: colour }}
                id={`lineage_filter_${lineage}`}
                checked={active}
                onChange={() => toggleLineage(lineage)}
              >
                {altName ? <span className={classNames('block text-gray-700')}>{altName}</span> : null}
                <span className={classNames({ 'text-xs tracking-wide leading-none text-gray-500': altName })}>{lineage}</span>
              </Checkbox>
            )
          })}
      </form>
    </div>
  )
}

export default LineageFilter
