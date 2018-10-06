const initialState = {
    accounts: {
        player: null,
        opponent: ""
    },
    globalError: null
}

export default (state = initialState, action) => {
    switch (action.type) {
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
                    ...state.accounts,
                    player: action.account
                }
            }
        case "GLOBAL_ERROR_MSG":
            return {
                ...state,
                globalError: action.errData.message
            }
        default:
            return state
    }
}
