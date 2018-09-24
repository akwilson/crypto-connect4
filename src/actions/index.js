import Connect4Web3 from "../Connect4Web3"

export const switchGame = gameId => ({
    type: "SWITCH_GAME",
    selected: gameId
})

export const statusAppend = (gameId, sType, date, message) => ({
    type: "STATUS_APPEND",
    statusData: {
        gameId: gameId,
        status: {
            sType,
            date,
            message
        }
    }
})

export const newGameReceipt = (sType, date, message) => ({
    type: "NEW_GAME_RECEIPT",
    status: {
        sType,
        date,
        message
    }
})

export const challengeAccepted = gameData => ({
    type: "CHALLENGE_ACCEPTED",
    gameData
})

export const newGameBegin = gameData => ({
    type: "NEW_GAME_BEGIN",
    gameData
})

export const gameOver = gameData => ({
    type: "GAME_OVER",
    gameData
})

export const gameResigned = gameData => ({
    type: "GAME_RESIGNED",
    gameData
})

export const gameDrawn = gameData => ({
    type: "GAME_DRAWN",
    gameData
})

export const opponentChange = opponent => ({
    type: "OPPONENT_CHANGE",
    opponent
})

export const nextMoveReceived = moveData => ({
    type: "NEXT_MOVE_RECEIVED",
    moveData
})

export const web3Init = accounts => ({
    type: "WEB3_INIT",
    accounts
})

export const errorAction = error => ({
    type: "ERROR_MSG",
    errMsg: error.message
})

export const selectedGridCol = column => ({
    type: "SELECTED_GRID_COL",
    column
})

export const highlightedGridCol = column => ({
    type: "HIGHLIGHTED_GRID_COL",
    column
})

export const boardDeselect = () => ({
    type: "BOARD_DESELECT"
})

export const activeGames = games => ({
    type: "ACTIVE_GAMES_LOADED",
    games
})

export const initialiseWeb3 = () => {
    return dispatch => {
        return Connect4Web3.init()
            .then(accounts => {
                dispatch(web3Init(accounts))
                return Connect4Web3.getActiveGames().then(games => dispatch(activeGames(games)))
            })
            .catch(err => dispatch(errorAction(err)))
    }
}

export const newGame = players => {
    return dispatch => {
        return Connect4Web3.newGame(players.player, players.opponent)
            .then(receipt => dispatch(newGameReceipt("New Game", new Date(), receipt.transactionHash)))
            .catch(err => dispatch(errorAction(err)))
    }
}

export const nextMove = moveData => {
    return dispatch => {
        return Connect4Web3.takeTurn(moveData.player, moveData.gameId, moveData.column)
            .then(receipt => dispatch(statusAppend(moveData.gameId, "Next Move", new Date(), receipt.transactionHash)))
            .catch(err => dispatch(errorAction(err)))
    }
}

export const resignGame = resignData => {
    return dispatch => {
        return Connect4Web3.resignGame(resignData.player, resignData.gameId)
            .then(receipt => dispatch(statusAppend(resignData.gameId, "Resigned", new Date(), receipt.transactionHash)))
            .catch(err => dispatch(errorAction(err)))
    }
}
