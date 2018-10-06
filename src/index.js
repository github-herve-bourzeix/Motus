import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import words from './words'
import _ from 'lodash'

import './styles.css'

const choisirMot = (max = 5) => {
  const filteredWords = words.filter(word => word.length <= max)
  const index = Math.floor(Math.random() * filteredWords.length)
  return filteredWords[index]
}

const StyleLettre = {
  width: '40px',
  height: '60px',
  fontSize: '45px',
  fontWeight: '500',
  textAlign: 'center',
  color: 'white',
  border: 'none',
  marginLeft: '5px',
  marginRight: '5px',
  background: 'grey',
  borderRadius: '10px'
}

const LettreOk = {
  background: 'green'
}

const LettreKo = {
  background: 'red'
}

const LettreMalPlacee = {
  background: 'blue'
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

class App extends Component {
  constructor() {
    super()
    this.state = this.getInitialState()
  }

  getInitialState() {
    const motChoisi = choisirMot()
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
      partieGagnee: false
    }
  }

  restart = () => {
    this.setState(this.getInitialState)
  }

  validerSaisie = () => {
    const { nombreEssai, motChoisi, motSaisi } = this.state

    const isLocaleEq = (x, y) => {
      return (
        x.localeCompare(y, 'en', {
          sensitivity: 'base'
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

    const lettreInvalides = []
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
        } else {
          if (!lettreInvalides.includes(lettre)) {
            lettreInvalides.push(lettre)
          }
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
      lettreInvalides
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
      niveau
    } = this.state
    return (
      <div className="App">
        <h1>
          Nombre d'essai:{nombreEssai} {motChoisi}
        </h1>
        <input type="radio" value="facile" checked={niveau === 'facile'} />{' '}
        facile
        <input type="radio" value="facile" /> moyen
        <input type="radio" value="facile" /> cauchemar
        <h2>Essaye de trouver le mot!</h2>
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
            <input type="button" value="Valider" onClick={this.validerSaisie} />
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

const rootElement = document.getElementById('root')

ReactDOM.render(<App />, rootElement)
