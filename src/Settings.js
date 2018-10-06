import React, { Component } from 'react'
import styled, { css } from 'styled-components'
import Button from './components/Button'

const Niveau = ({ name, ...props }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
    }}
  >
    <input name="niveau" type="radio" defaultValue={name} {...props} />
    <span style={{ marginLeft: '10px', marginBottom: '10px' }}>{name}</span>
  </div>
)

class Settings extends Component {
  onSave = () => {
    const { onSave } = this.props
    onSave({
      niveau: this.formRef['niveau'].value,
      theme: this.formRef['theme'].value,
    })
  }

  render() {
    return (
      <div
        style={{
          padding: '20px',
          fontFamily: 'helvetica',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2>Configure tes paramètres</h2>
        <form ref={ref => (this.formRef = ref)}>
          <Niveau name="facile" checked />
          <Niveau name="moyen" />
          <Niveau name="difficile" />
          <h3>Choisie un thème:</h3>
          <select name="theme" defaultValue="Apolline">
            <option>Zelda</option>
            <option>Pokemon</option>
            <option>Les nombres</option>
            <option>Apolline</option>
            <option>Dictionnaire</option>
          </select>
        </form>
        <Button primary type="button" value="ok" onClick={this.onSave}>
          ok
        </Button>
      </div>
    )
  }
}

export default Settings
