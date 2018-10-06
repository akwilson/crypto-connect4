const initialState = {
    accounts: {
        player: null,
        opponent: ""
    }
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
        default:
            return state
    }
}
