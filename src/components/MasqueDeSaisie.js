import React from "react";


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

export default MasqueDeSaisie