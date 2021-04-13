import React, { useMemo } from 'react'
import classNames from 'classnames'
import { useInView } from 'react-intersection-observer'

const StickyMobileSection = props => {
  const options = useMemo(() => ({
    threshold: [1]
  }), [])
  const { ref, inView } = useInView(options)
  return (
    <>
      <div
        className={classNames(
          props.className,
          'sticky z-30 bottom-0 -mx-3 bg-white rounded-t-lg transition-colors',
          'border-solid border-0 border-t border-transparent',
          { 'shadow-2xl border-gray-100': !inView }
        )}
      >
        {props.children}
      </div>
      {/* "sentinel" element - https://developers.google.com/web/updates/2017/09/sticky-headers */}
      <div className='h-0' ref={ref} />
    </>
  )
}

export default StickyMobileSection
