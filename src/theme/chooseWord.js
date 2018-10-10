import words from './words'
import apolline from './apolline'
import nombres from './nombres'
import pokemon from './pokemon'
import zelda from './zelda'
import _ from 'lodash'

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

const getWordList = theme => {
  switch (theme) {
    case 'Apolline':
      return apolline
    case 'Les nombres':
      return nombres
    case 'Pokemon':
      return pokemon
    case 'Zelda':
      return zelda
    default:
      return words
  }
}

export const createGetNextWord = (
  max = Number.POSITIVE_INFINITY,
  theme = 'Apolline'
) => {
  const words = getWordList(theme).filter(word => word.length <= max)

  return () => {
    const index = Math.floor(Math.random() * words.length)
    const result = words.splice(index, 1)
    console.info('Result', result)
    return result[0]
  }
}

export default choisirMot
