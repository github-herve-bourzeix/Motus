import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'

import './GameBoard'

import './styles.css'

import Button from './components/Button'
import Header from './components/Header'
import Dialog from './components/Dialog'
import Settings from './Settings'
import GradientBackground from './components/GradientBackground'
import chooseWord, { createGetNextWord } from './theme/chooseWord'
import MasqueDeSaisie from './components/MasqueDeSaisie'
import Speaker from './icons/Speaker'

const lireTexte = (() => {
  let isReading = false
  const u = new SpeechSynthesisUtterance()
  u.lang = 'fr-fr'
  u.rate = 0.8

  return text => {
    speechSynthesis.cancel()
    return new Promise(resolver => {
      u.onend = resolver
      u.text = text
      speechSynthesis.speak(u)
    })
  }
})()

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
    if (!_.isEqual(this.props.configuration, props.configuration)) {
      const {} = props.configuration
      const { niveau, theme } = props.configuration
      this.wordGenerator = createGetNextWord(
        this.getMaxLengthFromLevel(niveau),
        theme
      )
      this.setState(this.getInitialState(props))
    }
  }

  handleConfigure = () => {
    this.props.onConfigure()
  }

  getNextWord = () => {
    if (this.wordGenerator) {
      return this.wordGenerator()
    }
    return null
  }

  getInitialState(props) {
    let motChoisi = this.getNextWord()
    let partieTerminee = false
    if (motChoisi == null) {
      partieTerminee = true
      motChoisi = ''
    }
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
      partieTerminee,
      history: [],
    }
  }

  handleHelp = () => {
    lireTexte(`le mot est: ${this.state.motChoisi}`)
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
      if (isLocaleEq(motChoisi[index], lettre)) {
        result[index] = 1
      }
      return result
    }, [])

    const lettresOk = _.clone(monResultat)

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
      } else {
        monResultat[index] = 0
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

    if (partieGagnee) {
      lireTexte(`Bravo c'est trop stylé!!!`)
    } else {
      lireTexte(`presque, essaye encore le mot est: ${motChoisi}`)
    }

    this.setState(
      {
        partieGagnee,
        resultat: lettresOk,
        nombreEssai: nombreEssai + 1,
        lettreMauvaises: lettreInvalides,
        history: [
          {
            motChoisi: _.clone(motChoisi),
            motSaisi: _.clone(motSaisi),
            resultat: _.clone(monResultat),
          },
          ...this.state.history,
        ],
      },
      () => {
        if (partieGagnee) this.props.onWin(nombreEssai, motChoisi.length)
      }
    )
  }

  gererChangement = (index, lettreSaisie) => {
    const { motSaisi } = this.state
    motSaisi[index] = lettreSaisie
    this.setState({ motSaisi })
  }

  render = () => {
    const {
      partieGagnee,
      partieTerminee,
      motChoisi,
      motSaisi,
      resultat,
      nombreEssai,
      lettreMauvaises,
      niveau,
      history,
    } = this.state

    console.info('lettreMauvaises', lettreMauvaises)
    return (
      <div
        className="App"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-starts',
          overflow: 'scroll',
          height: '100vh',
          padding: '10px',
        }}
      >
        <div>
          <h2>Historique:{nombreEssai}</h2>
          <ol>
            {history.map(previous => (
              <li>
                <MasqueDeSaisie
                  readOnly={true}
                  mot={previous.motChoisi}
                  saisie={previous.motSaisi}
                  maxLength="1"
                  value={previous.resultat}
                  style={Object.assign({}, StyleLettre, {
                    height: '15px',
                    width: '15px',
                    fontSize: '10px',
                    borderRadius: '2px',
                  })}
                />
              </li>
            ))}
          </ol>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <h2>Essaye de trouver le mot!</h2>
          {!partieGagnee && (
            <div>
              {history[0] && (
                <MasqueDeSaisie
                  readOnly={true}
                  mot={history[0].motChoisi}
                  saisie={history[0].motSaisi}
                  maxLength="1"
                  value={history[0].resultat}
                  style={Object.assign({}, StyleLettre, {
                    height: '75px',
                    width: '75px',
                    fontSize: '60px',
                    borderRadius: '2px',
                  })}
                />
              )}

              <MasqueDeSaisie
                mot={motChoisi}
                saisie={motSaisi}
                maxLength="1"
                style={StyleLettre}
                value={resultat}
                onChange={this.gererChangement}
              />
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
              <Button primary onClick={this.validerSaisie}>
                Valider
              </Button>
              <Button value="Configure" onClick={this.handleConfigure}>
                Configurer
              </Button>

              <Speaker onClick={this.handleHelp} />
            </div>
          )}
          {partieGagnee && (
            <div>
              <h3> Bravo! </h3>
              <Button primary onClick={this.restart}>
                Mot suivant
              </Button>
            </div>
          )}

          {partieTerminee && (
            <div>
              <h3> Le jeu est fini </h3>
            </div>
          )}
        </div>
      </div>
    )
  }
}

class App extends Component {
  state = {
    isSettingsDialogOpened: true,
    configuration: {},
    score: 0,
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

  handleWin = (nombreEssai, tailleDuMot) => {
    this.setState({
      score: this.state.score + Math.max(1, tailleDuMot * 3 - nombreEssai),
    })
  }

  render() {
    const {
      configuration: { theme, niveau },
      score,
    } = this.state
    return (
      <GradientBackground>
        <Header>
          {theme && <span>Theme:{theme}</span>}
          {niveau && <span>Niveau:{niveau}</span>}
          <span>Score {score}</span>
        </Header>
        <Dialog open={this.state.isSettingsDialogOpened}>
          <Settings onSave={this.handleOnSave} />
        </Dialog>
        <MainBoard
          onConfigure={this.handleConfigure}
          configuration={this.state.configuration}
          onWin={this.handleWin}
        />
      </GradientBackground>
    )
  }
}

const rootElement = document.getElementById('root')

ReactDOM.render(<App />, rootElement)
