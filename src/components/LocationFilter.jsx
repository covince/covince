import './LocationFilter.css'

import React, { useCallback, useEffect, useRef } from 'react'
import { BsArrowUpShort, BsSearch } from 'react-icons/bs'
import { HiX } from 'react-icons/hi'
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from '@reach/combobox'

import { Heading, DescriptiveHeading } from './Typography'
import Spinner from './Spinner'
import FadeTransition from './FadeTransition'
import Button, { InlineButton } from './Button'

import { useMobile } from '../hooks/useMediaQuery'
import getConfig from '../config'

const Search = ({ onSelect, items, value, onChange, onClose }) => {
  const isMobile = useMobile()

  const _onChange = useCallback((e) => {
    onChange(e.target.value.toLowerCase())
  }, [onChange])

  const inputRef = useRef()
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  const _onSelect = value => {
    inputRef.current.blur()
    onClose()
    onSelect(value)
  }

  const onKeyUp = (e) => {
    if (e.code === 'Escape') onClose()
    if (e.code === 'Enter' && items.length === 1) _onSelect(items[0].id)
  }

  const { ontology } = getConfig()
  const { noun_plural, search_placeholder = noun_plural } = ontology.area

  const list = value.length
    ? (
        items.length > 0
          ? <ComboboxList className='w-full'>
            {items.map(({ id, name, matchingName, terms }) => (
              <ComboboxOption
                key={id}
                className='py-3 md:py-2 px-4 md:px-3 truncate no-webkit-tap'
                value={id}
              >
                <div>
                  { matchingName
                    ? <><span className='font-bold'>{name.slice(0, value.length)}</span>{name.slice(value.length)}</>
                    : name }
                  &nbsp;<span className='font-medium text-xs tracking-wide text-gray-500'>{id}</span>
                </div>
                {terms &&
                  <ul className='covince-search-term-list text-gray-500 text-sm truncate'>
                    {terms.map(term => <li key={term}><span className='font-bold'>{term.slice(0, value.length)}</span>{term.slice(value.length)}</li>)}
                  </ul> }
              </ComboboxOption>
            ))}
          </ComboboxList>
          : <span className='block py-3 md:py-2 px-4 md:px-3 text-sm'>
        No matches
      </span>
      )
    : null

  return (
    <Combobox aria-label="Areas" onSelect={_onSelect} onKeyUp={onKeyUp}>
      <ComboboxInput
        ref={inputRef}
        type="text"
        className="w-full h-11 md:h-9 md:text-sm rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-offset-0 focus:ring-opacity-40"
        value={value}
        onChange={_onChange}
        autocomplete={false}
        placeholder={search_placeholder}
      />
      { !!value.length && (isMobile
        ? <div className='mt-3 -mx-4'>{list}</div>
        : <ComboboxPopover
          className="rounded-md shadow-lg mt-2 mx-0 ring-1 ring-black ring-opacity-5 py-1.5 z-20"
        >
          {list}
        </ComboboxPopover>)}
    </Combobox>
  )
}

const LocationFilter = (props) => {
  const {
    className, loading, onChange,
    category, heading, subheading, showOverviewButton, loadOverview, overview,
    isSearching, setIsSearching, filteredItems, searchTerm, setSearchTerm
  } = props

  const searchButtonRef = useRef()
  const onSearchClose = useCallback(() => {
    setIsSearching(false)
  }, [setIsSearching])

  const previousIsSearching = useRef()
  useEffect(() => {
    if (previousIsSearching.current === true && isSearching === false) {
      searchButtonRef.current.focus()
    }
    previousIsSearching.current = isSearching
  }, [isSearching])

  return (
    <div className={className}>
      { isSearching
        ? <>
          <div className='flex justify-between items-center h-6 mb-3'>
            <DescriptiveHeading className='whitespace-nowrap'>
              Search
            </DescriptiveHeading>
            <Button
              className='box-content relative z-10 h-6 pt-0 pb-0 pl-1 pr-1'
              title='Close'
              onClick={onSearchClose}
            >
              <HiX className='h-4 w-4 fill-current text-gray-600' />
            </Button>
          </div>
          <Search
            onSelect={onChange}
            items={filteredItems}
            value={searchTerm}
            onChange={setSearchTerm}
            onClose={onSearchClose}
          />
        </>
        : <>
          <div className='flex justify-between items-center h-6'>
            <DescriptiveHeading className='whitespace-nowrap'>
              {category}
            </DescriptiveHeading>
            {showOverviewButton && <InlineButton
              title='Return to overview'
              className='pr-1 relative z-10'
              onClick={loadOverview}
              tabIndex={isSearching ? '-1' : undefined}
            >
              <BsArrowUpShort className='h-6 w-6 fill-current' />
              {overview.short_heading}
            </InlineButton> }
          </div>
          <div className='flex justify-between space-x-2 w-full'>
            <div className='flex-shrink min-w-0'>
              <Heading className='relative z-0 leading-6 truncate my-0.5'>
                {heading}
              </Heading>
              <p className='text-sm leading-6 h-6 text-gray-600 font-medium'>
                {subheading}
              </p>
            </div>
            <Button
              ref={searchButtonRef}
              className='flex-shrink-0 h-10 md:h-8 w-11 md:w-9 flex items-center justify-center mt-0.5'
              onClick={() => setIsSearching(true)} title='Search areas'
              tabIndex={isSearching ? '-1' : undefined}
            >
              <BsSearch className='flex-shrink-0 h-5 md:h-4 w-5 md:w-4 text-current' />
            </Button>
          </div>
        </> }
      <FadeTransition in={loading}>
        <div className='bg-white absolute inset-0 grid place-content-center z-10'>
          <Spinner className='text-gray-500 w-6 h-6' />
        </div>
      </FadeTransition>
    </div>
  )
}

export default LocationFilter
