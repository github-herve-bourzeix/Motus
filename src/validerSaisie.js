import _ from "lodash";

const isLocaleEq = (x, y) => {
    return (
        x.localeCompare(y, 'en', {
            sensitivity: 'base',
        }) === 0
    )
}

const getMaskResult = (motChoisi,motSaisi) => motSaisi.map(() => isLocaleEq())

const validerSaisie = ( nombreEssai, motChoisi, motSaisi, lettreMauvaises) => {

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

    const u = new SpeechSynthesisUtterance()
    u.text = partieGagnee ? 'Bravo' : 'presque, essaye encore'
    u.lang = 'fr-fr'
    u.rate = 1.0

    speechSynthesis.speak(u)

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