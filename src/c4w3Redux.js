import c4Web3 from "./Connect4Web3"
import * as actions from "./actions"

export default store => {
    c4Web3.on("NEW_GAME_OK", newGameData => {
        store.dispatch(actions.newGameBegin(newGameData))
    })

    c4Web3.on("NEW_GAME_ERROR", error => {
        store.dispatch(actions.errorAction(error))
    })

    c4Web3.on("NEXT_MOVE", moveData => {
        store.dispatch(actions.nextMove(moveData))
    })

	return next => action => {
		next(action)
	}
}
