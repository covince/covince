import React, { useMemo } from 'react'
import classNames from 'classnames'
import { useInView } from 'react-intersection-observer'

import Card from './Card'

const FilterSection = props => {
  const options = useMemo(() => ({
    threshold: [1]
  }), [])
  const { ref, inView } = useInView(options)
  return (
    <>
      {/* "sentinel" element - https://developers.google.com/web/updates/2017/09/sticky-headers */}
      <div ref={ref} className='-mt-20 h-1' />
      <Card
        {...props}
        className={classNames(
          props.className,
          'mb-3 sticky top-1 z-10 flex mx-auto transition-shadow',
          { 'md:shadow-md': !inView }
        )}
      />
    </>
  )
}

export default FilterSection
