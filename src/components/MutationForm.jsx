import './LineageMenu.css'

import React, { useState } from 'react'
import { Popover } from '@headlessui/react'
import { usePopper } from 'react-popper'
import { HiPlus } from 'react-icons/hi'
import classNames from 'classnames'

import Button from './Button'
import Input from './TextInput'

const MutationForm = ({ onSubmit, mutations, setMutations, disabled }) => {
  const [referenceElement, setReferenceElement] = useState()
  const [popperElement, setPopperElement] = useState()
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    strategy: 'fixed',
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'offset',
        enabled: true,
        options: {
          offset: [0, 4]
        }
      }
    ]
  })

  return (
    <Popover as={React.Fragment}>
      <Popover.Button
        as={Button}
        ref={setReferenceElement}
        disabled={disabled}
        className={`
          flex items-center py-0 pl-1.5 pr-1 border rounded space-x-1
          focus:primary-ring
        `}
      >
        <span>Mutations</span>
        <HiPlus className='w-4 h-4' />
      </Popover.Button>
      <Popover.Panel
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
        className={`
          covince-lineage-menu text-right
          shadow-lg bg-white dark:bg-gray-600 rounded-md py-3 z-10 space-y-1.5
          ring-1 ring-black dark:ring-gray-500 ring-opacity-5
        `}
      >
        <div className='px-3 space-y-3'>
          <form onSubmit={onSubmit} className='space-x-2'>
            <Input value={mutations} onChange={e => setMutations(e.target.value)} />
            <Button>Submit</Button>
          </form>
        </div>
      </Popover.Panel>
    </Popover>
  )
}

export default MutationForm
