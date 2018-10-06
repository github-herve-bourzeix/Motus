import React, { Component } from 'react'
import styled, { css } from 'styled-components'

const Button = styled.button`
  font-size:20px
  border-radius: 3px;
  padding: 0.25em 1em;
  margin: 1em 1em;
  background: black;
  color: palevioletred;
  border: 2px solid palevioletred;

  ${props =>
    props.primary &&
    css`
    text-transform:uppercase;
    background: palevioletred;
    color: white;
  `}
`

export default Button
