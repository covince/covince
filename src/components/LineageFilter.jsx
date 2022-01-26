import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react'
import classNames from 'classnames'
import { BsArrowUpShort, BsArrowDownShort } from 'react-icons/bs'

import Checkbox from './Checkbox'
import { DescriptiveHeading } from './Typography'
import Button from './Button'

import useNomenclature from '../hooks/useNomenclature'
import { useScreen } from '../hooks/useMediaQuery'

const defaultHeading = <DescriptiveHeading>Lineages</DescriptiveHeading>

const LineageFilter = (props) => {
  const {
    allSelected,
    className,
    emptyMessage,
    fixedLayout,
    heading = defaultHeading,
    isMobile,
    sortedLineages,
    toggleAll,
    toggleLineage
  } = props

  const isScrolling = useMemo(() => {
    return fixedLayout || sortedLineages.length > (isMobile ? 9 : 10)
  }, [fixedLayout, sortedLineages, isMobile])

  const sections = useMemo(() => {
    if (!isScrolling) {
      return [sortedLineages]
    }
    const sectionSize = isMobile ? 9 : 8
    const _sections = []
    const numSections = Math.ceil(sortedLineages.length / sectionSize) || 1
    for (let i = 0; i < numSections; i++) {
      const start = i * sectionSize
      _sections.push(sortedLineages.slice(start, start + sectionSize))
    }
    return _sections
  }, [sortedLineages, isMobile])

  const { nomenclature } = useNomenclature()
  const isLarge = useScreen('lg')

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
    const numColumns =
      isLarge && fixedLayout
        ? maxColumns
        : Math.max(2, Math.min(Math.ceil(numLineages / 2), maxColumns))
    return {
      ...style,
      gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))`
    }
  }, [sortedLineages, fixedLayout, isScrolling, isMobile, isLarge])

  const scrollContainer = useRef()
  const userScrolled = useRef(false)

  const doScroll = useCallback((direction) => {
    const { height } = scrollContainer.current.getBoundingClientRect()
    scrollContainer.current.scrollBy({
      top: height * direction,
      behavior: 'smooth'
    })
    userScrolled.current = true
  }, [])

  const sectionRefs = useRef([])
  const [currentSection, setCurrentSection] = useState(null)
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
    sectionRefs.current.filter(s => s).forEach(section => {
      observer.observe(section)
    })

    return function cleanup () {
      observer.disconnect()
    }
  }, [sections])

  const scrollUpBtnRef = useRef(null)
  const scrollDownBtnRef = useRef(null)

  useEffect(() => {
    if (isMobile || userScrolled.current === false) {
      return
    }
    if (currentSection === 0) {
      scrollDownBtnRef.current.focus()
    } else if (currentSection === sections.length - 1) {
      scrollUpBtnRef.current.focus()
    }
  }, [isMobile, currentSection])

  return (
    <div className={className}>
      <header className='flex justify-between space-x-6'>
        {heading}
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
      <div className='md:flex md:mt-0.5'>
        <form
          ref={scrollContainer}
          className={classNames(
            'overflow-auto hide-scrollbars flex-grow -mx-4 md:-mx-2 flex md:flex-col md:h-16',
            { 'lg:-mx-1': fixedLayout }
          )}
          style={{ scrollSnapType: isMobile ? 'x mandatory' : 'y mandatory' }}
        >
          {sections.map((lineages, i) => (
            <section
              key={`lineages-${i}`}
              ref={el => { sectionRefs.current[i] = el }}
              className={classNames(
                'w-full h-full flex-shrink-0 flex flex-wrap content-start px-4 md:px-0 md:grid md:gap-0.5 relative',
                { 'lg:px-1 md:w-104': fixedLayout }
              )}
              style={gridStyle}
            >
              { lineages.length > 0
                ? lineages.map(({ lineage, active, colour, altName, label = lineage, title = lineage }) => (
                  <Checkbox
                    key={lineage}
                    className={classNames(
                      'w-1/3 my-1 h-7 md:w-auto md:my-0 md:mx-2',
                      {
                        'md:mb-1': isScrolling && nomenclature.length === 0,
                        'lg:mx-0.5': fixedLayout
                      }
                    )}
                    title={title}
                    style={{ color: colour }}
                    id={`lineage_filter_${lineage}`}
                    checked={active}
                    onChange={() => toggleLineage(lineage)}
                  >
                    {altName ? <span className={classNames('block text-gray-700 dark:text-gray-100')}>{altName}</span> : null}
                    <span className={classNames({ 'text-xs tracking-wide leading-none text-gray-500 dark:text-gray-300': altName })}>{label}</span>
                  </Checkbox>
                ))
                : <>
                    <div className={classNames({ 'lg:w-24 lg:mx-0.5': fixedLayout })} />
                    <div className='absolute inset-0 flex items-center justify-center'>
                      {emptyMessage}
                    </div>
                  </> }
            </section>
          ))}
        </form>
        {(sections.length > 1 || (!isMobile && fixedLayout)) && (
          isMobile
            ? <ol className='list-none p-1 flex justify-center space-x-2'>
              { sections.map((_, i) =>
                <li
                  key={`section-indicator-${i}`}
                  className={classNames(
                    'rounded-full bg-gray-500 dark:bg-gray-300 w-2 h-2 transition-opacity',
                    { 'opacity-50': i !== currentSection || 0 }
                  )}
                />
              )}
            </ol>
            : <form onSubmit={e => e.preventDefault()}
              className={classNames(
                'flex flex-col justify-center relative left-1 pb-1 space-y-0.5 md:ml-2',
                { 'lg:ml-0': fixedLayout }
              )}
            >
            <Button
              ref={scrollUpBtnRef}
              title='Previous lineages'
              className='w-6 h-6 !p-0 flex items-center text-gray-700 dark:text-gray-200 transition-opacity disabled:opacity-50'
              onClick={() => doScroll(-1)}
              disabled={currentSection === 0 || null}
            >
              <BsArrowUpShort className='fill-current w-6 h-6'/>
            </Button>
            <Button
              ref={scrollDownBtnRef}
              title='Next lineages'
              className='w-6 h-6 !p-0 flex items-center text-gray-700 dark:text-gray-200 transition-opacity disabled:opacity-50'
              onClick={() => doScroll(1)}
              disabled={currentSection === sections.length - 1}
            >
              <BsArrowDownShort className='fill-current w-6 h-6'/>
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export default LineageFilter
