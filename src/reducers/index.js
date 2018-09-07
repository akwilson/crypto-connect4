import initialState from "./initialState"

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case "OPPONENT_CHANGE":
            return {
                ...state,
                accounts: {
                    ...state.accounts,
                    opponent: action.opponent
                }
            }
        case "NEW_GAME_RECEIPT":
            return {
                ...state,
                statusMessages: state.statusMessages.concat(action.receipt.transactionHash)
            }
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
        case "WEB3_INIT":
            return {
                ...state,
                accounts: {
                    player: action.accounts[0]
                }
            }
        case "HIGHLIGHTED_GRID_COL":
            return {
                ...state,
                game: {
                    ...state.game,
                    grid: {
                        ...state.game.grid,
                        highlightedCol: action.column
                    }
                }
            }
        case "SELECTED_GRID_COL":
            return {
                ...state,
                game: {
                    ...state.game,
                    grid: {
                        ...state.game.grid,
                        selectedCol: action.column
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

export default reducer
