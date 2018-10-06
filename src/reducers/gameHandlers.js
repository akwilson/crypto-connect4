const gameMoveHandlerMap = {
    "NEXT_MOVE_RECEIVED": nextMoveReceived,
    "GAME_OVER": (state, action) => ({ ...state, winner: action.gameData.winner, isPendingMove: false}),
    "GAME_DRAW": (state, action) => ({ ...state, isDraw: true, isPendingMove: false }),
    "GAME_RESIGNED": (state, action) => ({ ...state, resigner: action.gameData.resigner, isPendingMove: false })
}

const gameHandlerMap = {
    "CLAIM_WIN_TIMEOUT": (state, action) => ({ ...state, isClaimable: true }),
    "PENDING_MOVE": (state, action) => ({ ...state, isPendingMove: true }),
    "STATUS_APPEND": (state, action) => ({ ...state, statusMessages: state.statusMessages.concat(action.gameData.status) }),
    "ERROR_MSG": (state, action) => ({ ...state, errorMessage: parseGarbage(action.gameData.err.message) })
}

function nextMoveReceived(state, action) {
    const mv = {
        row: action.gameData.y,
        col: action.gameData.x
    }

    return {
        ...state,
        isPlayer1Next: action.gameData.isPlayer1Next,
        player1Moves: action.gameData.player === state.player1 ? state.player1Moves.concat(mv) : state.player1Moves,
        player2Moves: action.gameData.player === state.player2 ? state.player2Moves.concat(mv) : state.player2Moves,
        isClaimable: false,
        isPendingMove: false
    }
}

function parseGarbage(garbage) {
    const start = garbage.indexOf("revert")
    if (start >= 0) {
        return garbage.substring(start + 7)
    }

    // good luck
    return garbage
}

function mergeGame(state, game, index) {
    return {
        ...state,
        games: {
            ...state.games,
            [index]: game
        }
    }
}


function tryGameHandler(state, action) {
    let gameHandler = gameHandlerMap[action.type]
    if (gameHandler) {
        const newGame = gameHandler(state.games[action.gameData.gameId], action)
        return mergeGame(state, newGame, action.gameData.gameId)
    }

    // These handlers also change the title if the game is in the background
    gameHandler = gameMoveHandlerMap[action.type]
    if (gameHandler) {
        const newGame = gameHandler(state.games[action.gameData.gameId], action)
        newGame.title = state.selectedGame !== action.gameData.gameId ? newGame.title += " *" : newGame.title
        return mergeGame(state, newGame, action.gameData.gameId)
    }

    return null
}

export { mergeGame, tryGameHandler }
