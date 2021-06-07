import React, { useMemo } from 'react'
import classNames from 'classnames'
import { orderBy } from 'lodash'

import Checkbox from './Checkbox'
import { DescriptiveHeading } from './Typography'

import useWHONames from '../hooks/useWHONames'

const LineageFilter = ({ className, toggleLineage, activeLineages, allSelected, toggleAll }) => {
  const formStyle = useMemo(() => {
    const numLineages = Object.keys(activeLineages).length
    const numColumns = Math.max(2, Math.min(Math.ceil(numLineages / 2), 5))
    return { gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` }
  }, [activeLineages])

  const getWHOName = useWHONames()

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
        className='flex-grow flex flex-wrap md:grid grid-flow-row overflow-y-auto -mx-4 md:-mx-2 md:mt-1'
        style={formStyle}
      >
        {orderBy(
          Object.keys(activeLineages)
            .map(lineage => ({ lineage, who: getWHOName(lineage) })),
          ['who.sort', 'lineage']
        )
          .map(({ lineage, who }) => {
            const { active, colour } = activeLineages[lineage]
            return (
              <Checkbox
                key={lineage}
                className='mx-3 md:mx-1.5 my-1 md:my-0 md:h-7'
                style={{ color: colour }}
                id={`lineage_filter_${lineage}`}
                checked={active}
                onChange={() => toggleLineage(lineage)}
              >
                <span className={classNames('font-bold', { '_text-gray-800 block': who })}>{lineage}</span>
                {who ? <span className='text-xs tracking-wide leading-none text-gray-600'>{who.name}</span> : null}
              </Checkbox>
            )
          })}
      </form>
    </div>
  )
}

export default LineageFilter
