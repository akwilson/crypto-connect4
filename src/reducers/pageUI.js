const initialState = {
    accounts: {
        player: null,
        opponent: ""
    },
    errorMessage: null,
    statusMessages: []
}

export default (state = initialState, action) => {
    switch (action.type) {
        case "STATUS_APPEND":
            return {
                ...state,
                statusMessages: state.statusMessages.concat(action.message)
            }
        case "OPPONENT_CHANGE":
            return {
                ...state,
                accounts: {
                    ...state.accounts,
                    opponent: action.opponent
                }
            }
        case "NEW_GAME_BEGIN":
            return {
                ...state,
                accounts: {
                    ...state.accounts,
                    opponent: action.gameData.opponent
                }
            }
        case "WEB3_INIT":
            return {
                ...state,
                accounts: {
                    ...state.accounts,
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
