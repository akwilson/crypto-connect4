import Connect4Web3 from "../Connect4Web3"

export const statusAppend = message => ({
    type: "STATUS_APPEND",
    message
})

export const newGameBegin = gameData => ({
    type: "NEW_GAME_BEGIN",
    gameData
})

export const opponentChange = opponent => ({
    type: "OPPONENT_CHANGE",
    opponent
})

export const nextMoveReceived = (gameId, player, col, row) => ({
    type: "NEXT_MOVE_RECEIVED",
    move: { gameId, player, col, row }
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

export const initialiseWeb3 = () => {
    return dispatch => {
        return Connect4Web3.init()
            .then(accounts => dispatch(web3Init(accounts)))
            .catch(err => dispatch(errorAction(err)))
    }
}

export const newGame = players => {
    return dispatch => {
        return Connect4Web3.newGame(players.player, players.opponent)
            .then(receipt => dispatch(statusAppend(receipt.transactionHash)))
            .catch(err => dispatch(errorAction(err)))
    }
}

export const nextMove = moveData => {
    return dispatch => {
        return Connect4Web3.takeTurn(moveData.gameId, moveData.column, moveData.player)
            .then(receipt => dispatch(statusAppend(receipt.transactionHash)))
            .catch(err => dispatch(errorAction(err)))
    }
}
