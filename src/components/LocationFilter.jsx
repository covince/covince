import './LocationFilter.css'

import React, { useCallback, useEffect, useRef } from 'react'
import { BsArrowUpShort, BsSearch, BsX } from 'react-icons/bs'
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from '@reach/combobox'

import { Heading, DescriptiveHeading } from './Typography'
import Spinner from './Spinner'
import FadeTransition from './FadeTransition'
import { InlineButton, Button } from './Button'

const Search = ({ onSelect, items, value, onChange, onClose }) => {
  const _onChange = useCallback((e) => {
    onChange(e.target.value.toLowerCase())
  }, [onChange])

  const inputRef = useRef()
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  const _onSelect = useCallback(item => {
    inputRef.current.blur()
    onClose()
    onSelect(item)
  }, [onSelect])

  const onEscape = useCallback((e) => {
    if (e.code === 'Escape') onClose()
  }, [onClose])

  return (
    <Combobox aria-label="Areas" openOnFocus onSelect={_onSelect} onKeyUp={onEscape}>
      <div className='flex items-center space-x-3'>
        <ComboboxInput
          ref={inputRef}
          className="w-full text-base h-6 box-content pb-2 border-b-2 border-gray-200 focus:border-primary focus:outline-none"
          value={value}
          onChange={_onChange}
          autocomplete={false}
          placeholder={''}
        />
        <button className='flex-shrink-0 focus:outline-none border-2 border-transparent focus:border-primary rounded-full' onClick={onClose}>
          <BsX className='w-6 h-6 text-gray-500' />
        </button>
      </div>
      { items && !!value.length && (
        <ComboboxPopover className="rounded-md md:shadow-lg mt-1.5 md:ring-1 ring-black ring-opacity-5 md:text-sm py-1.5 z-20">
          { items.length > 0
            ? <ComboboxList className='w-full'>
              {items.slice(0, 10).map((result, index) => (
                <ComboboxOption
                  key={index}
                  className='py-1.5 md:px-3 truncate'
                  value={result.id}
                >
                  <span className='capitalize font-bold'>{value}</span>{result.name.slice(value.length)} <span className='font-medium text-sm md:text-xs tracking-wide text-gray-500'>{result.id}</span>
                </ComboboxOption>
              ))}
            </ComboboxList>
            : <span className='block py-1.5 px-3'>
              No matches
            </span> }
        </ComboboxPopover>
      )}
    </Combobox>
  )
}

const LocationFilter = (props) => {
  const {
    className, loading, value, areaList, onChange,
    category, heading, subheading, showOverviewButton, loadOverview, overview,
    isSearching, setIsSearching, filteredItems, searchTerm, setSearchTerm
  } = props
  return (
    <div className={className}>
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
      <Heading className='max-w-max flex items-center justify-between space-x-2 relative z-0 h-6'>
        <span className='truncate select-none'>{heading}</span>
        <Button
          className='flex-shrink-0 h-7 w-8 flex items-center justify-center'
          onClick={() => setIsSearching(true)} title='Search areas'
          tabIndex={isSearching ? '-1' : undefined}
        >
          <BsSearch className='flex-shrink-0 h-4 w-4 text-current' />
        </Button>
      </Heading>
      <p className='text-sm leading-6 h-6 mt-1 text-gray-600 font-medium'>
        {subheading}
      </p>
      <FadeTransition in={isSearching}>
        <div className='bg-white absolute inset-0 z-10'>
          <DescriptiveHeading className='h-6 mb-3'>Search</DescriptiveHeading>
          <Search
            onSelect={onChange}
            items={filteredItems}
            value={searchTerm}
            onChange={setSearchTerm}
            onClose={() => setIsSearching(false)}
          />
        </div>
      </FadeTransition>
      <FadeTransition in={loading}>
        <div className='bg-white absolute inset-0 grid place-content-center z-10'>
          <Spinner className='text-gray-500 w-6 h-6' />
        </div>
      </FadeTransition>
    </div>
  )
}

export default LocationFilter
