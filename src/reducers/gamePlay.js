const { mergeGame, tryGameHandler } = require("./gameHandlers.js")

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
    isClaimable: false,
    isPendingMove: false
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
    const newGame = tryGameHandler(state, action)
    if (newGame) {
        return newGame
    }

    switch (action.type) {
        case "SWITCH_GAME": {
            if (action.selected >= 0) {
                const currGame = state.games[action.selected]
                const pos = currGame.title.indexOf(" *")

                if (pos !== -1) {
                    const game = {
                        ...currGame,
                        title: currGame.title.substring(0, pos)
                    }

                    const newGame = mergeGame(state, game, action.selected)
                    newGame.selectedGame = action.selected
                    return newGame
                }
            }

            return {
                ...state,
                selectedGame: action.selected
            }
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
        case "CHALLENGE_ACCEPTED": {
            const ng = makeGame(state, action.gameData)
            const newState = mergeGame(state, ng, action.gameData.gameId)
            newState.selectedGame = action.gameData.gameId
            return newState
        }
        case "ACTIVE_GAMES_LOADED": {
            if (action.games.length) {
                const rv = activateGames(state, action.games)
                rv.selectedGame = Object.keys(rv.games)[0]
                return rv
            }

            return state
        }
        case "WEB3_INIT": {
            return {
                ...state,
                pendingStart: null,
                games: null,
                selectedGame: null
            }
        }
        default:
            return state
    }
}
