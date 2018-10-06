import React, { Component } from 'react'
import styled, { css } from 'styled-components'

export default styled(({ className, left, right }) => (
  <div className={className}>
    <div className="history">{left}</div>
    <div className="currentPlay">{right}</div>
  </div>
))`
  display:flex;
  flex-direction:column;
`
