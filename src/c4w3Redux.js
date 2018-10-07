import c4Web3 from "./Connect4Web3"
import { newGameBegin, gameOver, gameResigned, gameDrawn } from "./actions/gamePlay"
import { challengeAcceptedTimeout, nextMoveReceivedTimeout } from "./actions/gamePlayThunks"
import { globalErrorAction, accountChanged } from "./actions/pageUI"

export default store => {
    c4Web3.on("NEW_GAME_OK", newGameData => {
        store.dispatch(newGameBegin(newGameData))
    })

    c4Web3.on("CHALLENGE_ACCEPTED", newGameData => {
        store.dispatch(challengeAcceptedTimeout(newGameData))
    })

    c4Web3.on("GAME_ERROR", errData => {
        store.dispatch(globalErrorAction(errData))
    })

    c4Web3.on("NEXT_MOVE_OK", moveData => {
        store.dispatch(nextMoveReceivedTimeout(moveData))
    })

    c4Web3.on("GAME_OVER_OK", gameData => {
        store.dispatch(gameOver(gameData))
    })

    c4Web3.on("GAME_RESIGNED_OK", gameData => {
        store.dispatch(gameResigned(gameData))
    })

    c4Web3.on("GAME_DRAW_OK", gameData => {
        store.dispatch(gameDrawn(gameData))
    })

    c4Web3.on("ACCOUNT_CHANGED", account => {
        store.dispatch(accountChanged(account))
    })

	return next => action => {
		next(action)
	}
}
