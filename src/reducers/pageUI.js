const initialState = {
    accounts: {
        player: null,
        playerBalance: "0",
        opponent: ""
    },
    globalError: null
}

function parseGarbage(garbage) {
    const start = garbage.indexOf("revert")
    if (start >= 0) {
        return garbage.substring(start + 7)
    }

    // good luck
    return garbage
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
                globalError: parseGarbage(action.errData.message)
            }
        case "CLEAR_ERROR_MSG":
            return {
                ...state,
                globalError: null
            }
        case "BALANCE_UPDATE":
            return {
                ...state,
                accounts: {
                    ...state.accounts,
                    playerBalance: action.balance.balance
                }
            }
        default:
            return state
    }
}
