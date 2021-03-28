import React, { useMemo } from 'react'
import classNames from 'classnames'
import { useInView } from 'react-intersection-observer'

import Card from './Card'

const FilterSection = props => {
  const options = useMemo(() => ({
    threshold: [0],
    rootMargin: '-44px', // TODO: figure out why this works and remove magic number
    root: document.querySelector('main')
  }), [])
  const { ref, inView } = useInView(options)
  return (
    <Card
      {...props}
      ref={ref}
      className={classNames('mb-3 -mt-20 sticky top-1 z-10 flex mx-auto transition-shadow', { 'md:shadow-md': inView })}
    />
  )
}

export default FilterSection
