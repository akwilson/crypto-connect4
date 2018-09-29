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
    player1: null,
    player2: null,
    gameId: null,
    player1Moves: [],
    player2Moves: [],
    isPlayer1Next: true,
    winner: null,
    resigner: null,
    isDraw: false,
    statusMessages: [],
    errorMessage: null,
    isClaimable: false
}

function parseGarbage(garbage) {
    const start = garbage.indexOf("revert")
    if (start >= 0) {
        return garbage.substring(start + 7)
    }

    // good luck
    return garbage
}

function makeGame(state, gameData) {
    const num = state.games ? Object.keys(state.games).length + 1 : 1
    return {
        ...newGameState,
        player1: gameData.player1,
        player2: gameData.player2,
        gameId: gameData.gameId,
        isPlayer1Next: true,
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

function activateGames(state, games) {
    const rv = {
        ...state,
        games: {}
    }

    games.forEach((game, idx) => {
        rv.games[game.gameData.gameId] = {
            ...newGameState,
            gameId: game.gameData.gameId,
            player1: game.gameData.player1,
            player2: game.gameData.player2,
            player1Moves: game.gameData.player1Moves,
            player2Moves: game.gameData.player2Moves,
            isPlayer1Next: game.gameData.isPlayer1Next,
            title: `Game ${idx + 1}`,
            isClaimable: game.gameData.isClaimable
        }
    })

    return rv
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
                isPlayer1Next: action.moveData.isPlayer1Next,
                player1Moves: action.moveData.player === currGame.player1 ? currGame.player1Moves.concat(mv) : currGame.player1Moves,
                player2Moves: action.moveData.player === currGame.player2 ? currGame.player2Moves.concat(mv) : currGame.player2Moves,
                isClaimable: false
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
        case "ACTIVE_GAMES_LOADED": {
            if (action.games.length) {
                const rv = activateGames(state, action.games)
                rv.selectedGame = Object.keys(rv.games)[0]
                return rv
            }

            return state
        }
        case "CLAIM_WIN_TIMEOUT": {
            const game = {
                ...state.games[action.gameData.gameId],
                isClaimable: true
            }

            return {
                ...state,
                games: {
                    ...state.games,
                    [action.gameData.gameId]: game
                }
            }
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
            const game = {
                ...state.games[action.errData.gameId],
                errorMessage: parseGarbage(action.errData.err.message)
            }

            return {
                ...state,
                games: {
                    ...state.games,
                    [action.errData.gameId]: game
                }
            }
        default:
            return state
    }
}
