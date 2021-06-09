import React, { useMemo } from 'react'
import classNames from 'classnames'

import Checkbox from './Checkbox'
import { DescriptiveHeading } from './Typography'

const RouletteLabel = ({ roulette, lineage, who }) => {
  if (roulette === 'pango-who') {
    return (
      <>
        <span className={classNames('font-bold', { block: who })}>{lineage}</span>
        {who ? <span className='text-xs tracking-wide leading-none text-gray-600 '>{who.name}</span> : null}
      </>
    )
  }
  if (roulette === 'who-pango') {
    return (
      <>
        {who ? <span className={classNames('block font-bold')}>{who.name}</span> : null}
        <span className={classNames({ 'text-xs tracking-wide leading-none text-gray-600': who })}>{lineage}</span>
      </>
    )
  }
  if (roulette === 'who (pango)') {
    return (
      who
        ? who.name
        : <span className='text-gray-600'>({lineage})</span>
    )
  }

  return null
}

const LineageFilter = ({ className, toggleLineage, sortedLineages, allSelected, toggleAll, roulette, setRoulette }) => {
  const formStyle = useMemo(() => {
    const numLineages = sortedLineages.length
    const numColumns = Math.max(2, Math.min(Math.ceil(numLineages / 2), 5))
    return { gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` }
  }, [sortedLineages])

  return (
    <div className={className}>
      <header className='flex justify-between space-x-6'>
        <DescriptiveHeading>
          Lineages &mdash; <select className='uppercase font-medium border border-gray-300 rounded shadow-sm p-0.5'
          value={roulette} onChange={e => setRoulette(e.target.value)}
        >
            <option value='pango-who'>1. PANGO-WHO</option>
            <option value='who-pango'>2. WHO-PANGO</option>
            <option value='who (pango)'>3. WHO (PANGO)</option>
          </select>
        </DescriptiveHeading>
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
        {sortedLineages
          .map(({ lineage, active, colour, who }) => {
            return (
              <Checkbox
                key={lineage}
                className='mx-3 md:mx-1.5 my-1 md:my-0 md:h-7'
                style={{ color: colour }}
                id={`lineage_filter_${lineage}`}
                checked={active}
                onChange={() => toggleLineage(lineage)}
              >
                <RouletteLabel roulette={roulette} lineage={lineage} who={who} />
              </Checkbox>
            )
          })}
      </form>
    </div>
  )
}

export default LineageFilter
