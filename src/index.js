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
  height: '50px',
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
        let isOk = value[index] === true

        if (!isOk) {
          lettreRef.push(currentRef)
        }
        if (value[index] === true) {
          newStyle = Object.assign({}, style, LettreOk)
        } /*else if (value[index] === false && mot.includes(lettre)) {
          newStyle = Object.assign({}, style, LettreMalPlacee)
        } */ else if (
          value[index] === false
        ) {
          newStyle = Object.assign({}, style, LettreKo)
        }
        return (
          <Lettre
            value={saisie[index]}
            disabled={isOk}
            ref={currentRef}
            key={`${index}${lettre}`}
            onFocus={() => currentRef.current.select()}
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
    resultat[aideIndex] = true

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
    const x = motSaisi.reduce(
      ({ lettreSaisieRestantes, resultat }, lettre, index) => {
        console.info(lettreSaisieRestantes, resultat)
        if (isLocaleEq(motChoisi[index], lettre)) {
          resultat[index] = 1
          const indexOfLettre = lettreSaisieRestantes.indexOf(lettre)
          lettreSaisieRestantes.splice(indexOfLettre, 1)
        } else {
          const indexNext = lettreSaisieRestantes.indexOf(lettre)
          if (indexNext > 0 && !isLocaleEq(motSaisi[indexNext], lettre)) {
            resultat[index] = 2
            const indexOfLettre = lettreSaisieRestantes.indexOf(lettre)
            lettreSaisieRestantes.splice(indexOfLettre, 1)
          } else {
            resultat[index] = 0
          }
        }
        return {
          lettreSaisieRestantes,
          resultat
        }
      },
      { lettreSaisieRestantes: _.clone(motSaisi), resultat: [] }
    )

    const monResultat = motSaisi.reduce((result, lettre, index) => {
      result[index] = isLocaleEq(motChoisi[index], lettre)
      return result
    }, [])

    console.info('monResultat:', monResultat)
    const lettreRestantes = motChoisi
      .split('')
      .filter(
        (lettre, index) =>
          console.info(lettre, index, monResultat[index]) || !monResultat[index]
      )

    const z = motSaisi.reduce((result, lettre, index) => {
      if (monResultat[index]) {
        return result
      }

      const hasOccurence = motChoisi
        .split('')
        .slice(index)
        .some(x => isLocaleEq(x, lettre))
      console.info(
        `hasOccurence=${hasOccurence} of ${lettre} within ${motSaisi.slice(
          index
        )}`
      )

      if (hasOccurence) {
        console.info(`search for ${lettre} with ${result}`)
        const idxToRemove = result.find(x => isLocaleEq(x, lettre))
        if (idxToRemove > 0) {
          console.info('found an occurence in lettreRestantes=', result)
          result.splice(idxToRemove, 1)
        }
      }
      console.info('lettreRestantes=', result)
      return result
    }, lettreRestantes)

    console.info('z:', z)

    const partieGagnee =
      monResultat.length === motChoisi.length && monResultat.every(x => x)

    const u = new SpeechSynthesisUtterance()
    u.text = partieGagnee ? 'Bravo' : 'presque, essaye encore'
    u.lang = 'fr-fr'
    u.rate = 1.0

    speechSynthesis.speak(u)

    this.setState({
      partieGagnee,
      resultat: monResultat,
      nombreEssai: nombreEssai + 1
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
        <h1>Nombre d'essai:{nombreEssai}</h1>
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
