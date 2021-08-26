import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react'
import classNames from 'classnames'
import { BsArrowUpShort, BsArrowDownShort } from 'react-icons/bs'

import Checkbox from './Checkbox'
import { DescriptiveHeading } from './Typography'

import useNomenclature from '../hooks/useNomenclature'

const LineageFilter = ({ className, toggleLineage, sortedLineages, allSelected, toggleAll, isMobile }) => {
  const isScrolling = useMemo(() => {
    return sortedLineages.length > (isMobile ? 9 : 10)
  }, [sortedLineages, isMobile])

  const sections = useMemo(() => {
    if (!isScrolling) {
      return [sortedLineages]
    }
    const sectionSize = isMobile ? 9 : 8
    const _sections = []
    const numSections = Math.ceil(sortedLineages.length / sectionSize)
    for (let i = 0; i < numSections; i++) {
      const start = i * sectionSize
      _sections.push(sortedLineages.slice(start, start + sectionSize))
    }
    return _sections
  }, [sortedLineages, isMobile])

  const { nomenclature } = useNomenclature()

  const gridStyle = useMemo(() => {
    const style = {
      scrollSnapAlign: 'start',
      scrollSnapStop: 'always'
    }
    if (isMobile) {
      return style
    }
    const numLineages = sortedLineages.length
    const maxColumns = isScrolling ? 4 : 5
    const numColumns = Math.max(2, Math.min(Math.ceil(numLineages / 2), maxColumns))
    return {
      ...style,
      gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))`
    }
  }, [sortedLineages, isScrolling, isMobile])

  const scrollContainer = useRef()

  const doScroll = useCallback((direction) => {
    const { height } = scrollContainer.current.getBoundingClientRect()
    scrollContainer.current.scrollBy({
      top: height * direction,
      behavior: 'smooth'
    })
  })

  const sectionRefs = useRef([])
  const [currentSection, setCurrentSection] = useState(0)
  useEffect(() => {
    const callback = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = (sectionRefs.current).indexOf(entry.target)
          setCurrentSection(index)
        }
      })
    }

    const observer = new IntersectionObserver(callback, {
      root: scrollContainer.current,
      threshold: 0.6
    })
    sectionRefs.current.filter(h => h !== undefined).forEach(horse => {
      observer.observe(horse)
    })

    return function cleanup () {
      observer.disconnect()
    }
  }, [sections])

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
      <div className='md:flex md:space-x-3 md:mt-0.5'>
        <form
          ref={scrollContainer}
          className='overflow-auto hide-scrollbars flex-grow -mx-4 md:-mx-2 flex md:flex-col md:h-16'
          style={{ scrollSnapType: isMobile ? 'x mandatory' : 'y mandatory' }}
        >
          {sections.map((lineages, i) => (
            <section
              key={`lineages-${i}`}
              ref={el => { sectionRefs.current[i] = el }}
              className='w-full h-full flex-shrink-0 flex flex-wrap content-start px-4 md:px-0 md:grid md:gap-0.5'
              style={gridStyle}
            >
              {lineages
                .map(({ lineage, active, colour, altName }) => {
                  return (
                    <Checkbox
                      key={lineage}
                      className={classNames('w-1/3 my-1 h-7 md:w-auto md:my-0 md:mx-2', { 'md:mb-1': nomenclature.length === 0 })}
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
        { sections.length > 1 && (
          isMobile
            ? <ol className='list-none p-1 flex justify-center space-x-2'>
              { sections.map((_, i) =>
                <li
                  key={`section-indicator-${i}`}
                  className={classNames(
                    'rounded-full bg-gray-500 dark:bg-gray-300 w-2 h-2 transition-opacity',
                    { 'opacity-50': i !== currentSection }
                  )}
                />
              )}
            </ol>
            : <form onSubmit={e => e.preventDefault()} className='flex flex-col justify-center relative left-1 pb-1'>
            <button
              title='Previous lineages'
              className='text-gray-700 dark:text-gray-200 transition-opacity disabled:opacity-50'
              onClick={() => doScroll(-1)}
              disabled={currentSection === 0}
            >
              <BsArrowUpShort className='fill-current w-6 h-6'/>
            </button>
            <button
              title='Next lineages'
              className='text-gray-700 dark:text-gray-200 transition-opacity disabled:opacity-50'
              onClick={() => doScroll(1)}
              disabled={currentSection === sections.length - 1}
            >
              <BsArrowDownShort className='fill-current w-6 h-6'/>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default LineageFilter
