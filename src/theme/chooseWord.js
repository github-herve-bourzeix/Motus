import words from "./words";
import apolline from "./apolline";
import nombres from "./nombres";
import pokemon from "./pokemon";
import zelda from "./zelda";

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


export default choisirMot