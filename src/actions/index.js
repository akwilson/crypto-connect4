import Connect4Web3 from "../Connect4Web3"

const gameIdIntervalMap = {}
const claimTimeoutWindow = 1800000

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

export const errorAction = errData => ({
    type: "ERROR_MSG",
    errData
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

export const claimWinTimeout = gameId => ({
    type: "CLAIM_WIN_TIMEOUT",
    gameData: {
        gameId
    }
})

export const nextMoveReceivedTimeout = moveData => {
    return dispatch => {
        clearInterval(gameIdIntervalMap[moveData.gameId])
        gameIdIntervalMap[moveData.gameId] = setTimeout(() => dispatch(claimWinTimeout(moveData.gameId)), claimTimeoutWindow)
        dispatch(nextMoveReceived(moveData))
    }
}

export const challengeAcceptedTimeout = gameData => {
    return dispatch => {
        clearInterval(gameIdIntervalMap[gameData.gameId])
        gameIdIntervalMap[gameData.gameId] = setTimeout(() => dispatch(claimWinTimeout(gameData.gameId)), claimTimeoutWindow)
        dispatch(challengeAccepted(gameData))
    }
}

export const initialiseWeb3 = () => {
    return dispatch => {
        return Connect4Web3.init()
            .then(accounts => {
                dispatch(web3Init(accounts))
                return Connect4Web3.getActiveGames().then(games => {
                    dispatch(activeGames(games))
                    // HACK for messing with UI stuff, have some games to load from contract first
                    /*
                    dispatch(newGameReceipt("New Game", new Date(), "0x0a0c7987af23de7cb223323803da591bd390099ab87af88ea2e95272bdaa0049"))
                    dispatch(statusAppend(4, "New Game", new Date(), "0x0a0c7987af23de7cb223323803da591bd390099ab87af88ea2e95272bdaa0049"))
                    dispatch(statusAppend(4, "New Game", new Date(), "0x0a0c7987af23de7cb223323803da591bd390099ab87af88ea2e95272bdaa0049"))
                    //dispatch(gameOver({gameId: 4, winner: "0x20B31353e4b21e5C0e54E3d9A9cfB6E80B318d9d"}))
                    //dispatch(gameDrawn({gameId: 4}))
                    //dispatch(gameResigned({gameId: 4, resigner: "0x20B31353e4b21e5C0e54E3d9A9cfB6E80B318d9d"}))
                    */
                })
            })
            .catch(err => dispatch(errorAction({ gameId: 999, err })))
    }
}

export const newGame = players => {
    return dispatch => {
        return Connect4Web3.newGame(players.player, players.opponent)
            .then(transactionHash => dispatch(newGameReceipt("New Game", new Date(), transactionHash)))
            .catch(err => dispatch(errorAction({ gameId: 999, err })))
    }
}

export const nextMove = moveData => {
    return dispatch => {
        return Connect4Web3.takeTurn(moveData.player, moveData.gameId, moveData.column)
            .then(transactionHash => dispatch(statusAppend(moveData.gameId, "Next Move", new Date(), transactionHash)))
            .catch(err => dispatch(errorAction({ gameId: moveData.gameId, err })))
    }
}

export const resignGame = resignData => {
    return dispatch => {
        return Connect4Web3.resignGame(resignData.player, resignData.gameId)
            .then(transactionHash => dispatch(statusAppend(resignData.gameId, "Resigned", new Date(), transactionHash)))
            .catch(err => dispatch(errorAction({ gameId: resignData.gameId, err })))
    }
}

export const claimWin = gameData => {
    return dispatch => {
        return Connect4Web3.claimWin(gameData.player, gameData.gameId)
            .then(transactionHash => dispatch(statusAppend(gameData.gameId, "Win claimed", new Date(), transactionHash)))
            .catch(err => dispatch(errorAction({ gameId: gameData.gameId, err })))
    }
}
