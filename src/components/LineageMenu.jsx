import './LineageMenu.css'

import React, { useState } from 'react'
import { Popover } from '@headlessui/react'
import { usePopper } from 'react-popper'
import { HiDotsHorizontal } from 'react-icons/hi'
import classNames from 'classnames'

const LineageMenu = ({ palette, lineage, colour, setColour, children, className }) => {
  const [referenceElement, setReferenceElement] = useState()
  const [popperElement, setPopperElement] = useState()
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    strategy: 'fixed',
    placement: 'bottom-end',
    modifiers: [
      {
        name: 'offset',
        enabled: true,
        options: {
          offset: [4, 8]
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
        <HiDotsHorizontal className='w-5 h-5' />
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
        <div className='p-3 space-y-3 w-32'>
          <h4 className='font-bold text-xs tracking-wide text-subheading text-center'>Colour palette</h4>
          <ul className='grid grid-cols-3 gap-3 place-items-center'>
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
      </Popover.Panel>
    </Popover>
  )
}

export default LineageMenu
