const initialState = {
    accounts: {
        player: null,
        opponent: null
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
