import React, { useMemo } from 'react'
import classNames from 'classnames'
import { useInView } from 'react-intersection-observer'

import { PillButton } from './Button'

const StickyActionButton = props => {
  const options = useMemo(() => ({
    threshold: [1]
  }), [])
  const { ref, inView } = useInView(options)
  return (
    <>
      <PillButton
        className={classNames('sticky z-30 bottom-6 mx-auto mt-6 transition-shadow', { 'shadow-xl': !inView })}
        onClick={props.onClick}
      >
        {props.children}
      </PillButton>
      {/* "sentinel" element - https://developers.google.com/web/updates/2017/09/sticky-headers */}
      <div className='h-6' ref={ref} />
    </>
  )
}

export default StickyActionButton
