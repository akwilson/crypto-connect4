export const switchGame = gameId => ({
    type: "SWITCH_GAME",
    selected: gameId
})

export const statusAppend = (gameId, sType, date, message) => ({
    type: "STATUS_APPEND",
    gameData: {
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

export const nextMoveReceived = gameData => ({
    type: "NEXT_MOVE_RECEIVED",
    gameData
})

export const claimWinTimeout = gameId => ({
    type: "CLAIM_WIN_TIMEOUT",
    gameData: {
        gameId
    }
})

export const pendingMove = gameData => ({
    type: "PENDING_MOVE",
    gameData
})
