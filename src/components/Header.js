import React, { Component } from 'react'
import styled from 'styled-components'

const Header = styled(({ className, children }) => (
  <div className={className}>
    <span className="title">Motus</span>
    {children}
  </div>
))`
  padding:1em;
  font-family:helvetica;
  font-size:18px;
  background-color:black;
  color:white;
  display:flex;
  justify-content: space-between;
  flex-direction:row;
`
export default Header
