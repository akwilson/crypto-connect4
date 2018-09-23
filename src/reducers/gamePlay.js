const initialState = {
    boardDef: {
        height: 6,
        width: 7,
        tileSize: 30,
        tileMargin: 5
    },
    pendingStart: null,
    games: null,
    selectedGame: null
}

const newGameState = {
    gameId: null,
    playerMoves: [],
    opponentMoves: [],
    playerMove: true,
    winner: null,
    resigner: null,
    isDraw: false,
    statusMessages: [],
    errorMessage: null
}

function makeGame(state, gameData) {
    const num = state.games ? Object.keys(state.games).length + 1 : 1
    return {
        ...newGameState,
        gameId: gameData.gameId,
        playerMove: gameData.playerMove,
        title: `Game ${num}`
    }
}

function doNewGame(state, data) {
    let ng
    if (state.pendingStart.gameId) {
        ng = state.pendingStart
        ng.statusMessages = ng.statusMessages.concat(data)
    } else {
        ng = data
        ng.statusMessages = ng.statusMessages.concat(state.pendingStart)
    }

    return {
        ...state,
        pendingStart: null,
        games: {
            ...state.games,
            [ng.gameId]: ng
        },
        selectedGame: ng.gameId
    }
}

export default (state = initialState, action) => {
    switch (action.type) {
        case "SWITCH_GAME":
            return {
                ...state,
                selectedGame: action.selected
            }
        case "NEW_GAME_BEGIN": {
            const ng = makeGame(state, action.gameData)
            if (!state.pendingStart) {
                return {
                    ...state,
                    pendingStart: ng,
                    selectedGame: -1
                }
            }

            return doNewGame(state, ng)
        }
        case "CHALLENGE_ACCEPTED": {
            const ng = makeGame(state, action.gameData)
            return {
                ...state,
                games: {
                    ...state.games,
                    [action.gameData.gameId]: ng
                },
                selectedGame: action.gameData.gameId
            }
        }
        case "NEXT_MOVE_RECEIVED": {
            const mv = {
                row: action.moveData.y,
                col: action.moveData.x
            }

            const currGame = state.games[action.moveData.gameId]
            const game = {
                ...currGame,
                playerMove: action.moveData.playerMove,
                playerMoves: action.moveData.playerMove ? currGame.playerMoves : currGame.playerMoves.concat(mv),
                opponentMoves: action.moveData.playerMove ? currGame.opponentMoves.concat(mv) : currGame.opponentMoves
            }

            return {
                ...state,
                games: {
                    ...state.games,
                    [action.moveData.gameId]: game
                },
            }
        }
        case "GAME_OVER": {
            const game = {
                ...state.games[action.gameData.gameId],
                winner: action.gameData.winner
            }

            return {
                ...state,
                games: {
                    ...state.games,
                    [action.gameData.gameId]: game
                }
            }
        }
        case "GAME_RESIGNED": {
            const game = {
                ...state.games[action.gameData.gameId],
                resigner: action.gameData.resigner
            }

            return {
                ...state,
                games: {
                    ...state.games,
                    [action.gameData.gameId]: game
                }
            }
        }
        case "GAME_DRAWN": {
            const game = {
                ...state.games[action.gameData.gameId],
                isDraw: true
            }

            return {
                ...state,
                games: {
                    ...state.games,
                    [action.gameData.gameId]: game
                }
            }
        }
        case "NEW_GAME_RECEIPT": {
            if (!state.pendingStart) {
                return {
                    ...state,
                    pendingStart: action.status,
                    selectedGame: -1
                }
            }

            return doNewGame(state, action.status)
        }
        case "STATUS_APPEND": {
            const currGame = state.games[action.statusData.gameId]
            const game = {
                ...currGame,
                statusMessages: currGame.statusMessages.concat(action.statusData.status)
            }

            return {
                ...state,
                games: {
                    ...state.games,
                    [action.statusData.gameId]: game
                }
            }
        }
        case "ERROR_MSG":
            return {
                ...state,
                errorMessage: action.errMsg
            }
        default:
            return state
    }
}
