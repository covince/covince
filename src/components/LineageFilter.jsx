import React, { useMemo, useRef, useCallback } from 'react'
import classNames from 'classnames'
import { BsArrowUpShort, BsArrowDownShort } from 'react-icons/bs'

import Checkbox from './Checkbox'
import { DescriptiveHeading } from './Typography'

import useNomenclature from '../hooks/useNomenclature'

const LineageFilter = ({ className, toggleLineage, sortedLineages, allSelected, toggleAll, isMobile }) => {
  const _lineages = [
    sortedLineages[0], sortedLineages[0], sortedLineages[0],
    sortedLineages[0], sortedLineages[0], sortedLineages[0],
    sortedLineages[1], sortedLineages[1], sortedLineages[1],
    sortedLineages[1], sortedLineages[1], sortedLineages[1],
    sortedLineages[2], sortedLineages[2], sortedLineages[2],
    sortedLineages[2], sortedLineages[2], sortedLineages[2]
    // sortedLineages[2], sortedLineages[2], sortedLineages[2]
    // ...sortedLineages
  ]

  const sections = useMemo(() => {
    const sectionSize = isMobile ? 9 : 8
    const _sections = []
    const numSections = Math.ceil(_lineages.length / sectionSize)
    for (let i = 0; i < numSections; i++) {
      const start = i * sectionSize
      _sections.push(_lineages.slice(start, start + sectionSize))
    }
    return _sections
  }, [_lineages, isMobile])

  const { nomenclature } = useNomenclature()

  const gridStyle = useMemo(() => {
    const numLineages = _lineages.length
    const numColumns = Math.max(2, Math.min(Math.ceil(numLineages / 2), 4))
    return { gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` }
  }, [_lineages])

  const scrollContainer = useRef()

  const handleScroll = useCallback((direction) => {
    const { height } = scrollContainer.current.getBoundingClientRect()
    scrollContainer.current.scrollBy({
      [isMobile ? 'left' : 'top']: height * direction,
      behavior: 'smooth'
    })
  }, [isMobile])

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
      <div className='flex space-x-3'>
        <form
          ref={scrollContainer}
          className={classNames(
            'overflow-auto hide-scrollbars flex-grow flex md:flex-col md:-mx-2 md:mt-0.5 md:h-14 md:-mb-0.5'
            // { 'md:-mb-0.5': sections.length > 1 }
          )}
          style={{ scrollSnapType: isMobile ? 'x mandatory' : 'y mandatory' }}
        >
          {sections.map((lineages, i) => (
            <section key={i} className='w-full h-full flex-shrink-0 flex flex-wrap md:grid md:gap-0.5 md:content-start' style={{ ...gridStyle, scrollSnapAlign: 'start' }}>
              {lineages
                .map(({ lineage, active, colour, altName }) => {
                  return (
                    <Checkbox
                      key={lineage}
                      className={classNames('w-1/3 my-1 md:w-auto md:my-0 md:mx-2', { 'md:mb-1': nomenclature.length === 0 })}
                      style={{ color: colour }}
                      id={`lineage_filter_${lineage}`}
                      checked={active}
                      onChange={() => toggleLineage(lineage)}
                    >
                      {altName ? <span className={classNames('block text-gray-700 dark:text-gray-100')}>{altName}</span> : null}
                      <span className={classNames({ 'text-xs tracking-wide leading-none text-gray-500 dark:text-gray-300': altName })}>{lineage}</span>
                    </Checkbox>
                  )
                })}
            </section>
          ))}
        </form>
        { !isMobile && sections.length > 1 &&
          <form onSubmit={e => e.preventDefault()} className='flex flex-col justify-center relative left-1'>
            <button onClick={() => handleScroll(-1)}>
              <BsArrowUpShort className='fill-current w-6 h-6'/>
            </button>
            <button onClick={() => handleScroll(1)}>
              <BsArrowDownShort className='fill-current w-6 h-6'/>
            </button>
          </form> }
      </div>
    </div>
  )
}

export default LineageFilter
