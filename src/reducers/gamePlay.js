const initialState = {
    boardDef: {
        height: 6,
        width: 7,
        tileSize: 45
    },
    game: {
        gameId: null,
        playerMoves: [],
        opponentMoves: []
    }
}

export default (state = initialState, action) => {
    switch (action.type) {
        case "NEW_GAME_BEGIN":
            return {
                ...state,
                game: {
                    ...state.game,
                    gameId: action.gameData.gameId
                }
            }
        case "NEXT_MOVE":
            return action.move
        default:
            return state
    }
}