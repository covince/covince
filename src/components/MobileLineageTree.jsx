import React from 'react'
import classNames from 'classnames'
import { Menu, Transition } from '@headlessui/react'
import { BsThreeDotsVertical, BsCheckCircle } from 'react-icons/bs'

import Button, { PrimaryPillButton } from './Button'
import LineageTree from './LineageTree'
import SearchMutations from './SearchMutations'

import { LineageLimit, lineagePresets } from '../hooks/useDynamicComponents'
import useQueryAsState from '../hooks/useQueryAsState'

const MobileLineageTree = (props) => {
  const {
    api_url,
    darkMode,
    info,
    initialValues,
    lineageTree,
    onClose,
    searchingMutations,
    showMutationSearch
  } = props

  const [tempValues, setTempValues] = React.useState(initialValues)
  const [, updateQuery] = useQueryAsState()

  const numberSelected = React.useMemo(() => Object.keys(tempValues).length, [tempValues])
  const submit = React.useCallback((lineages, queryUpdate) => {
    updateQuery(queryUpdate)
    setTempValues(lineages)
  }, [tempValues])

  return (
    <>
    { props.searchingMutations
      ? <SearchMutations
          api_url={api_url}
          lineage={searchingMutations}
          lineageToColourIndex={tempValues}
          submit={submit}
          showMutationSearch={showMutationSearch}
          lineageTree={lineageTree}
          genes={info.genes}
        />
      : <LineageTree
          className='flex-grow pr-1.5'
          lineageToColourIndex={tempValues}
          submit={submit}
          {...lineageTree}
          showMutationSearch={showMutationSearch}
          darkMode={darkMode}
          numberSelected={numberSelected}
          action={
            <div className='space-x-3 px-1.5 flex items-center'>
              <LineageLimit
                className='text-base my-2.5'
                numberSelected={numberSelected}
                maxLineages={props.maxLineages}
              />
              <Menu as='div' className='relative z-10'>
                <Menu.Button as={Button} className='!p-2'>
                  <BsThreeDotsVertical className='w-6 h-6' />
                </Menu.Button>
                {/* Use the Transition component. */}
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Menu.Items
                    className={`
                      w-48
                      absolute z-20 top-full right-0 mt-2 origin-top-right
                      bg-white rounded-md shadow-xl ring-1 ring-black ring-opacity-5
                      divide-y divide-gray-200 focus:outline-none 
                      dark:bg-gray-600 dark:text-white dark:ring-gray-500 dark:divide-gray-500
                    `}
                  >
                    <div className='py-1'>
                      {lineagePresets.map(({ value, label }) => (
                        <Menu.Item key={value}>
                          <button
                            className={classNames(
                              'px-4 py-2 whitespace-nowrap w-full text-right flex items-center justify-end',
                              'no-webkit-tap focus:outline-none active:bg-gray-100 dark:active:bg-gray-700',
                              { 'font-bold': value === props.preset }
                            )}
                            onClick={() => props.setPreset(value)}
                          >
                            { value === props.preset &&
                              <BsCheckCircle className='flex-shrink-0 fill-current text-primary w-5 h-5 mr-2' /> }
                            {label}
                          </button>
                        </Menu.Item>
                      ))}
                    </div>
                    <div className='py-1'>
                      <Menu.Item>
                        <button
                          className={`
                            px-4 py-2 whitespace-nowrap w-full text-right
                            no-webkit-tap focus:outline-none active:bg-gray-100 dark:active:bg-gray-700
                          `}
                          onClick={() => setTempValues({})}
                        >
                          Clear selection
                        </button>
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          }
        /> }
      <footer className='absolute bottom-4 right-3'>
        <PrimaryPillButton className='shadow-lg' onClick={() => onClose(tempValues)}>Continue</PrimaryPillButton>
      </footer>
    </>
  )
}

export default MobileLineageTree
