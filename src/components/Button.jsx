import React from 'react'
import classnames from 'classnames'

export const Button = ({ as = 'button', ...props }) => (
  React.createElement(as, {
    ...props,
    className: classnames(props.className, [
      'bg-white py-2 px-3 border rounded-md shadow-sm text-sm leading-5',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
    ])
  })
)

export const DefaultButton = (props) =>
  <Button
    {...props}
    className={classnames(props.className, [
      'font-medium text-gray-700 hover:bg-gray-50 border-gray-300'
    ])}
  />

export default DefaultButton

export const PillButton = (props) => (
  <button
    {...props}
    className={classnames(props.className, [
      'px-4 p-2 text-sm rounded-full bg-primary font-bold text-white'
    ])}
  />
)

export const CircleButton = (props) => (
  <button
    {...props}
    className={classnames(props.className, [
      'bg-white p-1 border border-gray-300 rounded-full shadow-sm',
      'text-sm leading-5 font-medium text-gray-700',
      'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
    ])}
  />
)
