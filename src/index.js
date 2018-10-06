import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import words from './words'
import apolline from './theme/apolline'
import nombres from './theme/nombres'
import pokemon from './theme/pokemon'
import zelda from './theme/zelda'
import _ from 'lodash'

import './styles.css'

const choisirMot = (max = 5, theme = 'Apolline') => {
  console.info('selected theme:', theme)
  let themeWords = words
  if (theme === 'Apolline') {
    themeWords = apolline
  } else if (theme === 'Les nombres') {
    themeWords = nombres
  } else if (theme === 'Pokemon') {
    themeWords = pokemon
  } else if (theme === 'Zelda') {
    themeWords = zelda
  }

  const filteredWords = themeWords.filter(word => word.length <= max)
  const index = Math.floor(Math.random() * filteredWords.length)
  return filteredWords[index]
}

const StyleLettre = {
  width: '100px',
  height: '100px',
  fontSize: '80px',
  fontWeight: '500',
  textAlign: 'center',
  color: 'white',
  border: 'none',
  marginLeft: '10px',
  marginRight: '10px',
  marginBottom: '10px',
  background: 'grey',
  borderRadius: '10px',
}

const LettreOk = {
  background: 'green',
}

const LettreKo = {
  background: 'red',
}

const LettreMalPlacee = {
  background: 'blue',
}

// const Lettre = props => <input type="text" {...props} />

const Lettre = React.forwardRef((props, ref) => (
  <input type="text" ref={ref} {...props} />
))

const MasqueDeSaisie = ({
  mot = 'pasdemot',
  saisie = [],
  value = [],
  onChange,
  style,
  ...props
}) => {
  let lettreRef = []
  return (
    <div>
      {mot.split('').map((lettre, index) => {
        const currentRefIndex = lettreRef.length
        const currentRef = React.createRef()

        let newStyle = style
        let isOk = value[index] === 1

        if (!isOk) {
          lettreRef.push(currentRef)
        }
        if (value[index] === 1) {
          newStyle = Object.assign({}, style, LettreOk)
        } else if (value[index] === 2) {
          newStyle = Object.assign({}, style, LettreMalPlacee)
        } else if (value[index] === 0) {
          newStyle = Object.assign({}, style, LettreKo)
        }
        return (
          <Lettre
            value={saisie[index]}
            readOnly={isOk}
            ref={currentRef}
            key={`${index}${lettre}`}
            onFocus={() => {
              if (!isOk) {
                currentRef.current.select()
              }
            }}
            onChange={e => {
              onChange(index, e.target.value)

              const next =
                lettreRef[(currentRefIndex + 1) % lettreRef.length].current
              next.focus()
              next.select()
            }}
            style={newStyle}
            {...props}
          />
        )
      })}
    </div>
  )
}

class MainBoard extends Component {
  constructor(props) {
    super(props)
    this.state = this.getInitialState()
  }

  getMaxLengthFromLevel = niveau => {
    switch (niveau) {
      case 'moyen':
        return 7
      case 'cauchemar':
        return Number.POSITIVE_INFINITY
      case 'facile ':
      default:
        return 5
    }
  }

  componentWillReceiveProps(props) {
    this.setState(this.getInitialState(props))
  }

  handleConfigure = () => {
    this.props.onConfigure()
  }

  getInitialState(props) {
    const { niveau, theme } = (props || this.props).configuration

    const motChoisi = choisirMot(this.getMaxLengthFromLevel(niveau), theme)
    const aideIndex = Math.floor(Math.random() * motChoisi.length)
    const motSaisi = []
    motSaisi[aideIndex] = motChoisi.split('')[aideIndex]
    const resultat = []
    resultat[aideIndex] = 1

    return {
      niveau: 'facile',
      nombreEssai: 0,
      motChoisi,
      motSaisi,
      resultat,
      lettreMauvaises: [],
      partieGagnee: false,
    }
  }

  restart = () => {
    this.setState(() => this.getInitialState())
  }

  validerSaisie = () => {
    const { nombreEssai, motChoisi, motSaisi, lettreMauvaises } = this.state

    const isLocaleEq = (x, y) => {
      return (
        x.localeCompare(y, 'en', {
          sensitivity: 'base',
        }) === 0
      )
    }

    const monResultat = motSaisi.reduce((result, lettre, index) => {
      result[index] = isLocaleEq(motChoisi[index], lettre) ? 1 : 0
      return result
    }, [])

    console.info('monResultat:', monResultat)
    const lettreRestantes = motChoisi
      .split('')
      .filter(
        (lettre, index) =>
          console.info(lettre, index, monResultat[index]) || !monResultat[index]
      )

    console.info('lettreRestantes:', lettreRestantes)

    const lettreInvalides = [...lettreMauvaises]
    const z = motSaisi.reduce((result, lettre, index) => {
      if (monResultat[index]) {
        return result
      }

      const hasOccurence = motChoisi.split('').some(x => isLocaleEq(x, lettre))
      console.info(
        `hasOccurence=${hasOccurence} of ${lettre} within ${motChoisi.split(
          ''
        )}`
      )

      if (hasOccurence) {
        console.info(`search for ${lettre} with ${result}`)
        const idxToRemove = result.findIndex(
          x =>
            console.info(`is ${x} === ${lettre}:${isLocaleEq(x, lettre)}`) ||
            isLocaleEq(x, lettre)
        )
        console.info('idxToRemove', idxToRemove)
        if (idxToRemove >= 0) {
          console.info('found an occurence in lettreRestantes=', result)
          result.splice(idxToRemove, 1)
          monResultat[index] = 2
        }
      } else {
        if (!lettreInvalides.includes(lettre)) {
          lettreInvalides.push(lettre)
        }
      }
      console.info('lettreRestantes=', result)
      return result
    }, lettreRestantes)

    const partieGagnee =
      monResultat.length === motChoisi.length && monResultat.every(x => x === 1)

    const u = new SpeechSynthesisUtterance()
    u.text = partieGagnee ? 'Bravo' : 'presque, essaye encore'
    u.lang = 'fr-fr'
    u.rate = 1.0

    speechSynthesis.speak(u)

    this.setState({
      partieGagnee,
      resultat: monResultat,
      nombreEssai: nombreEssai + 1,
      lettreMauvaises: lettreInvalides,
    })
  }

  gererChangement = (index, lettreSaisie) => {
    const { motSaisi } = this.state
    motSaisi[index] = lettreSaisie
    this.setState({ motSaisi })
  }

  render = () => {
    const {
      partieGagnee,
      motChoisi,
      motSaisi,
      resultat,
      nombreEssai,
      lettreMauvaises,
      niveau,
    } = this.state

    console.info('lettreMauvaises', lettreMauvaises)
    return (
      <div className="App">
        <input type="button" value="Configure" onClick={this.handleConfigure} />
        <h1>Nombre d'essai:{nombreEssai}</h1>

        <h2>Essaye de trouver le mot!</h2>
        <h2>
          <MasqueDeSaisie
            readOnly={true}
            mot={lettreMauvaises.join('')}
            saisie={lettreMauvaises.join('')}
            maxLength="1"
            value={lettreMauvaises.map(x => 1)}
            style={Object.assign({}, StyleLettre, {
              height: '30px',
              width: '30px',
              fontSize: '25px',
              borderRadius: '90px',
              backgroundColor: 'purple',
            })}
          />
        </h2>
        {!partieGagnee && (
          <div>
            <MasqueDeSaisie
              mot={motChoisi}
              saisie={motSaisi}
              maxLength="1"
              style={StyleLettre}
              value={resultat}
              onChange={this.gererChangement}
            />
            <input
              type="button"
              value="Valider"
              onClick={this.validerSaisie}
              style={{
                width: '200px',
                lineHeight: '299px',
                fontSize: '60px',
                height: '200px',
              }}
            />
          </div>
        )}
        {partieGagnee && (
          <div>
            <h3> Bravo! </h3>
            <input type="button" value="Recommencer" onClick={this.restart} />
          </div>
        )}
      </div>
    )
  }
}

const Dialog = ({ children, open = true }) => (
  <div style={{ display: open ? '' : 'none' }}>
    <div
      style={{
        position: 'absolute',
        zIndex: 1,
        height: '100vh',
        width: '100vw',
        opacity: '0.3',
        backgroundColor: 'black',
      }}
    />
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 2,
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        style={{
          justifyContent: 'center',
          display: 'flex',
          marginTop: 'auto',
          marginBottom: 'auto',
          width: '75vw',
          background: 'white',
        }}
      >
        {children}
      </div>
    </div>
  </div>
)

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
          </select>
          <hr />
        </form>
        <input type="button" value="ok" onClick={this.onSave} />
      </div>
    )
  }
}

class App extends Component {
  state = {
    isSettingsDialogOpened: true,
    configuration: {},
  }
  handleOnSave = configuration => {
    console.info('configuration', configuration)

    this.setState({
      isSettingsDialogOpened: false,
      configuration,
    })
  }

  handleConfigure = () => {
    this.setState({
      isSettingsDialogOpened: true,
    })
  }

  render() {
    return (
      <>
        <Dialog open={this.state.isSettingsDialogOpened}>
          <Settings onSave={this.handleOnSave} />
        </Dialog>
        <MainBoard
          onConfigure={this.handleConfigure}
          configuration={this.state.configuration}
        />
      </>
    )
  }
}

const rootElement = document.getElementById('root')

ReactDOM.render(<App />, rootElement)
