import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

const _Dialog = ({ children, isOpen, onClose }) => (
  <Transition show={isOpen} as={Fragment}>
    <Dialog
      className='fixed z-50 inset-0 flex items-center justify-center'
      onClose={onClose}
    >
      <Transition.Child
        as={Fragment}
        enter="ease-in-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in-out duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Dialog.Overlay className='fixed inset-0 bg-gray-900 dark:bg-gray-100 opacity-25' />
      </Transition.Child>
      <Transition.Child
        as={Fragment}
        enter="ease-in-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in-out duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        {children}
      </Transition.Child>
    </Dialog>
  </Transition>
)

export default _Dialog
