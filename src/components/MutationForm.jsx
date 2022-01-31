import React, { useEffect } from 'react'

import Button from './Button'
import Input from './TextInput'

const MutationForm = ({ label = 'Mutation query', initialValue = '', onSubmit, onRemove }) => {
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

  const handleRemove = (e) => {
    e.stopPropagation()
    onRemove()
  }

  return (
    <div className='p-3 space-y-2'>
      <form onSubmit={handleSubmit} className='space-y-1.5 dark:text-white'>
        <label>
          <span className='block font-bold text-xs tracking-wide text-subheading mb-2'>{label}</span>
          <Input ref={inputRef} className='dark:bg-gray-500 dark:border-gray-400' value={mutations} onChange={e => setMutations(e.target.value)} />
        </label>
        <footer className='flex justify-between items-center'>
          <Button className='!py-1 px-2 dark:bg-gray-500 dark:border-gray-400 dark:text-white'>Apply</Button>
          { onRemove &&
            <button
              onClick={handleRemove}
              className='p-1 text-sm leading-none text-subheading rounded border border-transparent focus:primary-ring'>
                Remove
            </button> }
        </footer>
      </form>
    </div>
  )
}

export default MutationForm
