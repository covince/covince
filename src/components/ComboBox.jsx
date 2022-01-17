import './ComboBox.css'

import React, { useCallback, useEffect, useRef } from 'react'
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from '@reach/combobox'

import TextInput from './TextInput'

const HighlightMatch = ({ index, length, children }) => (
  <>
    {children.slice(0, index)}
    <span className='font-bold'>{children.slice(index, index + length)}</span>
    {children.slice(index + length)}
  </>
)

const DefaultPopover = ({ children }) => (
  <ComboboxPopover
    className="rounded-md shadow-lg mt-2 mx-0 ring-1 ring-black dark:ring-gray-400 ring-opacity-5 py-1.5 z-20"
  >
    {children}
  </ComboboxPopover>
)

const ComboBox = ({ onSelect, items, value, onChange, onClose, placeholder, ariaLabel, popover = DefaultPopover }) => {
  const _onChange = useCallback((e) => {
    onChange(e.target.value)
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

  const list = value.length
    ? (items.length > 0
        ? <ComboboxList className='w-full'>
            {items.map(({ id, name, description, isNameMatch, matchIndex, terms }) => (
              <ComboboxOption
                key={id}
                className='py-3 md:py-2 px-4 md:px-3 no-webkit-tap'
                value={id}
              >
                <div className='truncate dark:text-white'>
                  { isNameMatch
                    ? <HighlightMatch index={matchIndex} length={value.length}>{name}</HighlightMatch>
                    : name }
                  &nbsp;<span className='font-medium text-xs tracking-wide text-subheading'>{description}</span>
                </div>
                { terms &&
                  <ul className='covince-search-term-list text-subheading text-sm truncate'>
                    { terms.map(({ term, matchIndex }) =>
                      <li key={term}>
                        <HighlightMatch index={matchIndex} length={value.length}>{term}</HighlightMatch>
                      </li>
                    )}
                  </ul> }
              </ComboboxOption>
            ))}
          </ComboboxList>
        : <span className='block py-3 md:py-2 px-4 md:px-3 text-sm'>No matches</span>
      )
    : null

  return (
    <Combobox aria-label={ariaLabel} onSelect={_onSelect} onKeyUp={onKeyUp} openOnFocus={value.length > 0}>
      <ComboboxInput
        as={TextInput}
        ref={inputRef}
        type="text"
        className='w-full'
        value={value}
        onChange={_onChange}
        autocomplete={false}
        placeholder={placeholder}
      />
      { !!value.length && React.createElement(popover, {}, list) }
    </Combobox>
  )
}

export default ComboBox
