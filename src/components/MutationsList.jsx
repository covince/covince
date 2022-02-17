import React, { useRef, useState, useMemo, useEffect } from 'react'
import { BsArrowDownShort as SortDesc, BsArrowUpShort as SortAsc } from 'react-icons/bs'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import classNames from 'classnames'
import Measure from 'react-measure'

import Spinner from './Spinner'
import FadeTransition from './FadeTransition'

import useMutationsList from '../hooks/useMutationsList'
import { useScreen } from '../hooks/useMediaQuery'

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
      'px-3 py-1.5 cursor-pointer sticky top-0 z-0',
      'text-xs leading-5 font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider',
      align === 'right' ? 'text-right' : 'text-left'
    )}
  >
    <span className={classNames('h-full flex items-center space-x-1 select-none leading-4', { 'text-primary font-bold': sorted, 'justify-end': align === 'right' })}>
      {children}
    </span>
  </div>
)

const formatFrequency = f => {
  const _f = (f * 100).toPrecision(3)
  return _f.startsWith('0.000') ? '> 0.001' : _f
}

const MutationsList = props => {
  const {
    api_url,
    denominator,
    filter,
    gene,
    lineage,
    loading,
    queryParams,
    selected,
    selectMutation
  } = props

  const [state, actions] = useMutationsList(api_url, queryParams, lineage, gene, filter)
  const isTableLayout = useScreen('sm')
  const [listSize, setListSize] = useState({ width: 0, height: 0 })

  const hasNextPage = state.rows.length < state.total
  const itemCount = hasNextPage ? state.rows.length + 1 : state.rows.length
  const isItemLoaded = index => !hasNextPage || index < state.rows.length

  const loaderRef = useRef()

  const [syncedDenominator, setSyncedDenominator] = useState(denominator)

  useEffect(() => {
    if (loading === false && state.isLoading === false && denominator !== syncedDenominator) {
      setSyncedDenominator(denominator)
    }
  }, [loading, state.isLoading])

  const showFrequency = useMemo(() => {
    return denominator === syncedDenominator
  }, [denominator, syncedDenominator])

  console.log(showFrequency, denominator, syncedDenominator)

  return (
    <div className='flex-grow flex flex-col bg-white dark:bg-gray-700'>
      <div className='flex border-b border-solid dark:border-gray-500'>
        <TableHeader
          key='not-searching'
          className='w-1/2'
          sorted={state.sortColumn === 'name'}
          onClick={() => actions.sortBy('name')}
        >
          <span className={classNames({ 'mr-1': state.sortColumn !== 'name' })}>Mutation</span>
          {state.sortColumn === 'name' && <TableSort active ascending={state.sortAscending} /> }
        </TableHeader>
        <TableHeader
          className='w-1/2'
          sorted={state.sortColumn === 'count'}
          align='right'
          onClick={() => actions.sortBy('count')}
        >
          <TableSort active={state.sortColumn === 'count'} ascending={state.sortAscending} />
          <span className={classNames('whitespace-nowrap', { 'text-center leading-4': !isTableLayout })}>
            Frequency
          </span>
        </TableHeader>
        {/* <TableHeader
          className='w-1/4'
          sorted={state.sortColumn === 'total'}
          align='right'
          onClick={() => actions.sortBy('total')}
        >
          <TableSort active={state.sortColumn === 'total'} ascending={state.sortAscending} />
          <span className={classNames({ 'whitespace-nowrap text-center leading-4': !isTableLayout })}>Total Samples</span>
        </TableHeader> */}
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
                      // const previous = state.rows[index - 1]
                      return (
                        <div
                          style={style}
                          className={classNames(
                            'flex items-baseline cursor-pointer text-sm hover:bg-gray-50 dark:hover:bg-gray-600 rounded',
                            {
                              'bg-gray-50 dark:bg-gray-600': selected === row.mutation
                            }
                          )}
                          onClick={() => selectMutation(row.mutation)}
                        >
                          { row &&
                            <>
                              <span className={classNames('px-3 flex-grow leading-9 font-medium', { 'text-primary': selected === row.mutation })}>{row.mutation}</span>
                              <span className='px-3 w-1/4 leading-9 text-sm text-right whitespace-nowrap'>
                                {showFrequency ? `${formatFrequency(row.count / syncedDenominator)}%` : ''}
                              </span>
                              <span className='px-3 w-1/4 leading-9 text-sm text-right'>{row.count.toLocaleString()}</span>
                            </> }
                        </div>
                      )
                    }
                    if (state.rows.length > 0 && hasNextPage) {
                      return (
                        <div
                          style={style}
                          className='grid place-items-center'
                        >
                          <Spinner className='block h-5 w-5 text-gray-600 dark:text-gray-300' />
                        </div>
                      )
                    }
                    return null
                  }}
                </List>
              )}
            </InfiniteLoader>
            <FadeTransition in={state.isLoading && state.rows.length === 0}>
              <div className='absolute inset-0 z-10 grid place-items-center'>
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
