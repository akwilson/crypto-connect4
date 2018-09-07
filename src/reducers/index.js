import initialState from "./initialState"

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case "NEW_GAME":
            return action.players
        case "NEXT_MOVE":
            return action.move
        case "WEB3_INIT":
            return {
                ...state,
                accounts: {
                    player: action.accounts[0]
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
