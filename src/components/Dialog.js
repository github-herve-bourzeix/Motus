import React, { Component } from 'react'
import styled, { css } from 'styled-components'

const Overlay = styled.div`
  position: absolute;
  z-index: 1;
  height: 100vh;
  width: 100vw;
  opacity: 0.3;
  background-color: black;
`

const Wrapper = styled.div`
  position: absolute; 
  display: flex;
  justify-content: center;
  z-index: 2;  
  width: 100vw;
  height: 100vh; 
`

const Content = styled.div`
  justify-content: center;
  display: flex;
  margin-top: auto;
  margin-bottom: auto;
  width: 75vw;
  background: white;
`

const Dialog = ({ children, open = true }) => (
  <div style={{ display: open ? '' : 'none' }}>
    <Overlay />
    <Wrapper>
      <Content>{children}</Content>
    </Wrapper>
  </div>
)

export default Dialog
