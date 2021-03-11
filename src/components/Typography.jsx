import React from 'react'
import classnames from 'classnames'

export const Heading = ({ tag = 'h2', className, ...props }) =>
  React.createElement(tag, {
    className: classnames(className, 'text-gray-600 text-xl font-bold leading-6'),
    ...props
  })

export const DescriptiveHeading = ({ tag = 'p', className, ...props }) =>
  React.createElement(tag, {
    className: classnames(className, 'uppercase font-medium text-gray-500 text-xs tracking-wide leading-6'),
    ...props
  })
