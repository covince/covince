import React from 'react'
import classnames from 'classnames'

export const Heading = ({ as = 'h2', className, ...props }) =>
  React.createElement(as, {
    className: classnames(className, 'text-heading text-xl font-heading font-bold leading-6'),
    ...props
  })

export const DescriptiveHeading = ({ as = 'p', className, ...props }) =>
  React.createElement(as, {
    className: classnames(className, 'uppercase font-medium text-subheading text-xs tracking-wide leading-6'),
    ...props
  })
