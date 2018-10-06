import React, { Component } from 'react'
import styled from 'styled-components'

const InputWithForwardRef = React.forwardRef((props, ref) => (
  <input ref={ref} type="text" {...props} />
))

export const Lettre = styled(({ className }) => (
  <InputWithForwardRef className={className} />
))`
  width: 100px;
  height: 100px;
  font-size: 80px;
  font-weight: 500;
  text-align: center;
  color: white;
  border: none;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
  background: grey;
  border-radius: 10px;
`
