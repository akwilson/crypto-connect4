const initialState = {
    boardDef: {
        height: 6,
        width: 7,
        tileSize: 30,
        tileMargin: 5
    },
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
    isDraw: false
}

export default (state = initialState, action) => {
    switch (action.type) {
        case "SWITCH_GAME":
            return {
                ...state,
                selectedGame: action.selected
            }
        case "NEW_GAME_BEGIN": {
            const num = state.games ? Object.keys(state.games).length + 1 : 1
            const ng = {
                ...newGameState,
                gameId: action.gameData.gameId,
                playerMove: action.gameData.playerMove,
                title: `Game ${num}`
            }

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
        default:
            return state
    }
}
