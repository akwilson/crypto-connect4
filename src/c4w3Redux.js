import c4Web3 from "./Connect4Web3"
import * as actions from "./actions"

export default store => {
    c4Web3.on("NEW_GAME_OK", newGameData => {
        store.dispatch(actions.newGameBegin(newGameData))
    })

    c4Web3.on("CHALLENGE_ACCEPTED", newGameData => {
        store.dispatch(actions.challengeAcceptedTimeout(newGameData))
    })

    c4Web3.on("GAME_ERROR", errData => {
        store.dispatch(actions.errorAction(errData))
    })

    c4Web3.on("NEXT_MOVE_OK", moveData => {
        store.dispatch(actions.nextMoveReceivedTimeout(moveData))
    })

    c4Web3.on("GAME_OVER_OK", gameData => {
        store.dispatch(actions.gameOver(gameData))
    })

    c4Web3.on("GAME_RESIGNED_OK", gameData => {
        store.dispatch(actions.gameResigned(gameData))
    })

    c4Web3.on("GAME_DRAW_OK", gameData => {
        store.dispatch(actions.gameDrawn(gameData))
    })

    c4Web3.on("ACCOUNT_CHANGED", account => {
        store.dispatch(actions.accountChanged(account))
    })

	return next => action => {
		next(action)
	}
}
