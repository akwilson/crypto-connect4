const initialState = {
    boardDef: {
        height: 6,
        width: 7,
        tileSize: 30
    },
    game: {
        gameId: null,
        playerMoves: [],
        opponentMoves: [],
        playerMove: true,
        winner: null
    }
}

export default (state = initialState, action) => {
    switch (action.type) {
        case "NEW_GAME_BEGIN":
            return {
                ...state,
                game: {
                    ...state.game,
                    gameId: action.gameData.gameId,
                    playerMove: action.gameData.playerMove
                }
            }
        case "NEXT_MOVE_RECEIVED":
            const mv = {
                row: action.moveData.y,
                col: action.moveData.x
            }

            return {
                ...state,
                game: {
                    ...state.game,
                    playerMove: action.moveData.playerMove,
                    playerMoves: action.moveData.playerMove ? state.game.playerMoves : state.game.playerMoves.concat(mv),
                    opponentMoves: action.moveData.playerMove ? state.game.opponentMoves.concat(mv) : state.game.opponentMoves
                }
            }
        case "GAME_OVER":
            return {
                ...state,
                game: {
                    ...state.game,
                    winner: action.gameData.winner
                }
            }
        default:
            return state
    }
}
