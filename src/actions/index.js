export const newGame = players => ({
    type: "NEW_GAME",
    players
})

export const nextMove = (gameId, column) => ({
    type: "NEXT_MOVE",
    move: { gameId, column }
})

export const web3Init = accounts => ({
    type: "WEB3_INIT",
    accounts
})

export const errorAction = error => ({
    type: "ERROR_MSG",
    errMsg: error.message
})
