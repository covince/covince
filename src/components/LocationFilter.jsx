import './LocationFilter.css'
import '@reach/combobox/styles.css'

import React, { useCallback } from 'react'
import { BsArrowUpShort, BsSearch } from 'react-icons/bs'
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption, ComboboxOptionText } from '@reach/combobox'

import { Heading, DescriptiveHeading } from './Typography'
import Spinner from './Spinner'
import FadeTransition from './FadeTransition'
import { InlineButton } from './Button'

const Search = ({ onChange, items, value, setValue }) => {
  const _onChange = useCallback((e) => {
    setValue(e.target.value.toLowerCase())
  }, [setValue])

  return (
    <Combobox aria-label="Areas" openOnFocus>
      <ComboboxInput className="" value={value} onChange={_onChange} />
      { items && (
        <ComboboxPopover className="">
          { items.length > 0
            ? <ComboboxList>
              {items.slice(0, 10).map((result, index) => (
                <ComboboxOption
                  key={index}
                  value={`${result.name}, ${result.id}`}
                />
              ))}
            </ComboboxList>
            : <span style={{ display: 'block', margin: 8 }}>
              No results found
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
      { isSearching
        ? <>
          <DescriptiveHeading className='h-6'>Search</DescriptiveHeading>
          <Search onChange={onChange} items={filteredItems} value={searchTerm} setValue={setSearchTerm} />
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
            >
              <BsArrowUpShort className='h-6 w-6 fill-current' />
              {overview.short_heading}
            </InlineButton> }
          </div>
          <Heading className='max-w-max flex items-center justify-between space-x-2 relative z-0 h-6'>
            <span className='truncate select-none'>{heading}</span>
            <button className='flex-shrink-0 p-1.5 box-content border border-gray-300 rounded-md text-current shadow-sm covince-location-select-focus' onClick={() => setIsSearching(true)}>
              <BsSearch className='h-4 w-4 text-current' />
            </button>
          </Heading>
          <p className='text-sm leading-6 h-6 mt-1 text-gray-600 font-medium'>
            {subheading}
          </p>
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
