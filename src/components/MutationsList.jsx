import React, { useRef, useState, useMemo, useEffect } from 'react'
import { BsArrowDownShort as SortDesc, BsArrowUpShort as SortAsc, BsCheckCircle } from 'react-icons/bs'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import classNames from 'classnames'
import Measure from 'react-measure'

import Spinner from './Spinner'
import FadeTransition from './FadeTransition'
import Checkbox from './Checkbox'

import useMutationsList from '../hooks/useMutationsList'

const TableSort = ({ active, ascending }) => (
  <span className='text-primary w-6 h-6 flex-shrink-0'>
    {active
      ? ascending
        ? <SortAsc className='w-full h-full' />
        : <SortDesc className='w-full h-full' />
      : null}
  </span>
)

const TableHeader = ({ children, className, sorted, align, ...props }) => (
  <div
    {...props}
    scope="col"
    className={classNames(
      className,
      'py-1.5 cursor-pointer sticky top-0 z-0',
      'text-xs leading-5 font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider',
      align === 'right' ? 'text-right' : 'text-left'
    )}
  >
    <span className={classNames('h-full flex items-center select-none leading-4', { 'text-primary font-bold': sorted, 'justify-end': align === 'right' })}>
      {children}
    </span>
  </div>
)

const formatFrequency = f => {
  const _f = (f * 100).toPrecision(3)
  if (_f.startsWith('0.000')) return '> 0.001'
  if (_f.startsWith('-0.000')) return '< -0.001'
  return _f
}

const MutationsList = props => {
  const {
    api_url,
    dates,
    filter,
    gene,
    isLarge,
    lineagesForApi,
    mode,
    pangoClade,
    queryParams,
    selected,
    selectMutation
  } = props

  const [state, actions] = useMutationsList(api_url, queryParams, pangoClade, lineagesForApi, gene, filter, dates)
  const [listSize, setListSize] = useState({ width: 0, height: 0 })

  const hasNextPage = state.rows.length < state.total
  const itemCount = hasNextPage ? state.rows.length + 1 : state.rows.length
  const isItemLoaded = index => !hasNextPage || index < state.rows.length

  const loaderRef = useRef()

  const showFrequency = useMemo(() => {
    return !!state.denominator
  }, [state.denominator])

  useEffect(() => {
    if (state.loading === 'LIST' && loaderRef.current) {
      loaderRef.current._listRef.scrollTo(0)
    }
  }, [state.loading])

  const FormControl = mode === 'mutli' ? Checkbox : Checkbox

  return (
    <div className='flex-grow flex flex-col bg-white dark:bg-gray-700'>
      <div className='flex border-b border-solid dark:border-gray-500'>
        <div className='flex flex-grow space-x-4 lg:space-x-6 px-4 lg:px-6'>
          <TableHeader
            key='not-searching'
            className='mr-auto pl-4'
            sorted={state.sortColumn === 'name'}
            onClick={() => actions.sortBy('name')}
          >
            <span className={classNames({ 'mr-1': state.sortColumn !== 'name' })}>Mutation</span>
            {state.sortColumn === 'name' && <TableSort active ascending={state.sortAscending} /> }
          </TableHeader>
          <TableHeader
            sorted={state.sortColumn === 'prop'}
            className='w-1/4'
            align='right'
            onClick={() => actions.sortBy('prop')}
          >
            <TableSort active={state.sortColumn === 'prop'} ascending={state.sortAscending} />
            <span className='whitespace-nowrap'>
              Proportion
            </span>
          </TableHeader>
          <TableHeader
            sorted={state.sortColumn === 'change'}
            className='w-1/4 lg:w-1/5'
            align='right'
            onClick={() => actions.sortBy('change')}
          >
            <TableSort active={state.sortColumn === 'change'} ascending={state.sortAscending} />
            <span>
              {/* Growth */}
              Recent<br/> Change
            </span>
          </TableHeader>
        </div>
        <div>
          <div className='overflow-y-scroll heron-styled-scrollbars opacity-0' />
        </div>
      </div>
      <Measure
        bounds
        onResize={rect => {
          setListSize({
            width: rect.bounds.width,
            height: rect.bounds.height
          })
        }}
      >
        {({ measureRef }) => (
          <div ref={measureRef} className='flex-grow relative'>
            <div className='absolute w-full' style={{ height: listSize.height }}>
              <InfiniteLoader
                ref={loaderRef}
                isItemLoaded={isItemLoaded}
                itemCount={itemCount}
                loadMoreItems={actions.loadMoreItems}
                threshold={state.rows.length ? 0 : undefined}
              >
                {({ onItemsRendered, ref }) => (
                  <List
                    className='!overflow-y-scroll heron-styled-scrollbars'
                    height={listSize.height}
                    itemCount={itemCount}
                    itemSize={36}
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                    width={listSize.width}
                  >
                    {({ index, style }) => {
                      if (index < state.rows.length) {
                        const row = state.rows[index]
                        const isSelected = selected.includes(row.mutation)
                        // const previous = state.rows[index - 1]
                        return (
                          <label
                            className={classNames(
                              'pl-2 pr-4 space-x-4 lg:pl-3 lg:pr-6 lg:space-x-6 flex items-baseline cursor-pointer text-sm leading-9 big:text-base big:leading-9 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-sm',
                              { 'font-medium': isSelected }
                            )}
                            style={style}
                          >
                            { row &&
                              <>
                                <span className='flex-grow flex items-baseline'>
                                  <FormControl
                                    className='mr-3 text-primary self-center'
                                    checked={isSelected}
                                    id={'mut-select-' + row.mutation}
                                    onChange={() => selectMutation(row.mutation)}
                                  />
                                  <span>{row.mutation}</span>
                                  {/* { isSelected && <BsCheckCircle className='flex-shrink-0 fill-current text-primary w-4 h-4 ml-2 self-center' /> } */}
                                </span>
                                <span className='w-1/4 text-right whitespace-nowrap' title={!isLarge && `${row.count.toLocaleString()} sample${row.count === 1 ? '' : 's'}`}>
                                  { isLarge && <span className='text-subheading'>{row.count.toLocaleString()}<span className='mx-2'>/</span></span> }
                                  {showFrequency ? `${formatFrequency(row.count / state.denominator)}%` : ''}
                                </span>
                                <span className='w-1/4 lg:w-1/5 text-right whitespace-nowrap'>
                                  {`${formatFrequency(row.growth)}%`}
                                </span>
                              </> }
                          </label>
                        )
                      }
                      if (state.rows.length > 0 && hasNextPage) {
                        return (
                          <div style={style} className='grid place-items-center'>
                            <Spinner className='block h-5 w-5 text-gray-600 dark:text-gray-300' />
                          </div>
                        )
                      }
                      return null
                    }}
                  </List>
                )}
              </InfiniteLoader>
            </div>
            <FadeTransition in={state.loading === 'LIST'}>
              <div className='absolute inset-0 z-10 flex justify-center items-center bg-white bg-opacity-50 dark:bg-gray-700 dark:bg-opacity-50'>
                <Spinner className='block h-6 w-6 text-gray-600 dark:text-gray-300' />
              </div>
            </FadeTransition>
          </div>
        )}
      </Measure>
    </div>
  )
}

export default MutationsList
