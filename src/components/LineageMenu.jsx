import './LineageMenu.css'

import React, { useState } from 'react'
import { Popover } from '@headlessui/react'
import { usePopper } from 'react-popper'
import { HiDotsHorizontal } from 'react-icons/hi'
import classNames from 'classnames'

export const ColourPalette = ({ palette, lineage, colour, setColour }) => (
  <div className='p-3 space-y-3 w-32'>
    <h4 className='font-bold text-xs tracking-wide text-subheading text-center'>Colour palette</h4>
    <ul className='grid grid-cols-3 gap-3 place-items-center pb-1'>
      {palette.map((item, i) => (
        <li key={i}>
          <button
            // title={item.desc}
            onClick={() => setColour(lineage, i)}
            className={classNames(
              'block h-4 w-4 bg-current rounded ring-offset-2 dark:ring-offset-gray-600 no-webkit-tap',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-dark-primary',
              { 'ring-2 ring-current': item === colour }
            )}
            style={{ color: item }}
          />
        </li>
      ))}
    </ul>
  </div>
)

const defaults = {
  placement: 'bottom',
  offset: [0, 8]
}

const LineageMenu = props => {
  const {
    children,
    className,
    buttonLabel = <HiDotsHorizontal className='w-5 h-5' />,
    placement = defaults.Button,
    offset = defaults.offset
  } = props

  const [referenceElement, setReferenceElement] = useState()
  const [popperElement, setPopperElement] = useState()
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    strategy: 'fixed',
    placement,
    modifiers: [
      {
        name: 'offset',
        enabled: true,
        options: {
          offset
        }
      }
    ]
  })

  return (
    <Popover as={React.Fragment}>
      <Popover.Button
        ref={setReferenceElement}
        className='py-0 px-1 md:px-0.5 border border-transparent font-medium text-gray-500 dark:text-gray-300 rounded focus:primary-ring'
      >
        {buttonLabel}
      </Popover.Button>
      <Popover.Panel
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
        className={classNames(
          'shadow-lg bg-white dark:bg-gray-600 rounded-md z-10',
          'ring-1 ring-black dark:ring-gray-500 ring-opacity-5',
          className
        )}
      >
        {children}
      </Popover.Panel>
    </Popover>
  )
}

export default LineageMenu
