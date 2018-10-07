import Connect4Web3 from "../Connect4Web3"

export const opponentChange = opponent => ({
    type: "OPPONENT_CHANGE",
    opponent
})

export const web3Init = account => ({
    type: "WEB3_INIT",
    account
})

export const globalErrorAction = errData => ({
    type: "GLOBAL_ERROR_MSG",
    errData
})

export const clearError = () => ({
    type: "CLEAR_ERROR_MSG"
})

export const activeGames = games => ({
    type: "ACTIVE_GAMES_LOADED",
    games
})

export const accountChanged = account => {
    return dispatch => {
        dispatch(web3Init(account))
        return Connect4Web3.getActiveGames()
            .then(games => {
                dispatch(activeGames(games))
                // HACK for messing with UI stuff, have some games to load from contract first
                //dispatch(newGameReceipt("New Game", new Date(), "0x0a0c7987af23de7cb223323803da591bd390099ab87af88ea2e95272bdaa0049"))
                //dispatch(statusAppend(3, "New Game", new Date(), "0x0a0c7987af23de7cb223323803da591bd390099ab87af88ea2e95272bdaa0049"))
                //dispatch(statusAppend(3, "New Game", new Date(), "0x0a0c7987af23de7cb223323803da591bd390099ab87af88ea2e95272bdaa0049"))
                //dispatch(gameOver({gameId: 4, winner: "0x20B31353e4b21e5C0e54E3d9A9cfB6E80B318d9d"}))
                //dispatch(gameDrawn({gameId: 4}))
                //dispatch(gameResigned({gameId: 4, resigner: "0x20B31353e4b21e5C0e54E3d9A9cfB6E80B318d9d"}))
            })
            .catch(err => dispatch(globalErrorAction(err)))
    }
}

export const initialiseWeb3 = () => {
    return dispatch => {
        return Connect4Web3.init()
            .then(account => {
                if (account) {
                    dispatch(accountChanged(account))
                }
            })
            .catch(err => dispatch(globalErrorAction(err)))
    }
}
