import React, { useEffect } from 'react'

import Button from './Button'
import Input from './TextInput'

const MutationForm = ({ initialValue, onSubmit }) => {
  const inputRef = React.useRef()
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const [mutations, setMutations] = React.useState(initialValue)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(mutations)
  }

  return (
    <div className='p-3 space-y-2'>
      <form onSubmit={handleSubmit} className='space-y-1.5 dark:text-white'>
        <label>
          <span className='block font-bold text-xs tracking-wide text-subheading mb-1.5'>Mutation query</span>
          <Input ref={inputRef} className='dark:bg-gray-500 dark:border-gray-400' value={mutations} onChange={e => setMutations(e.target.value)} />
        </label>
        <footer className='block'>
          <Button className='!py-1 px-2 dark:bg-gray-500 dark:border-gray-400 dark:text-white'>Apply</Button>
        </footer>
      </form>
    </div>
  )
}

export default MutationForm
