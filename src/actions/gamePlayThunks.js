import Connect4Web3 from "../Connect4Web3"
import * as gamePlay from "./gamePlay"
import { clearError, globalErrorAction } from "./pageUI"

const gameIdIntervalMap = {}
const claimTimeoutWindow = 1800000

/**
 * Dispatch pending move if the move has not already come from the web3 event first.
 *
 * Typical case is
 *   1. call nextMove()
 *   2. get TxnHash -> dispatch pendingMove() -> set isPendingMove to true on game state
 *   3. Web3 NextMove event -> triggers nextMoveReceived() -> set isPendingMove to false on game state
 * If 3 happens before 2 we have a problem: the game state ends up in pending move and cannot
 * be reset by nextMoveReceived(). To resolve this we check that the current move is
 * the player's before dispatching pendingMove(). If nextMoveReceived() comes in first
 * it will toggle isPlayer1Next.
 *
 * @param Object state      the Redux state
 * @param Function dispatch the Redux dispatch function
 * @param Object moveData   data for the current action
 */
function possiblyDispatchPendingMove(state, dispatch, moveData) {
    const player = state.pageUI.accounts.player
    const { player1, player2, isPlayer1Next } = state.gamePlay.games[moveData.gameId]

    if ((isPlayer1Next && (player === player1)) || (!isPlayer1Next && (player === player2))) {
        dispatch(gamePlay.pendingMove(moveData))
    }
}

/**
 * Similar to above but checks that the game has not been marked as finished before dispatching pendingMove().
 *
 * @param Object state      the Redux state
 * @param Function dispatch the Redux dispatch function
 * @param Object moveData   data for the current action
 */
function possiblyDispatchPendingMoveIfGameNotOver(state, dispatch, moveData) {
    const { winner, resigner, isDraw } = state.gamePlay.games[moveData.gameId]
    if (!winner && !resigner && !isDraw) {
        dispatch(gamePlay.pendingMove(moveData))
    }
}

export const nextMoveReceivedTimeout = moveData => {
    return dispatch => {
        clearInterval(gameIdIntervalMap[moveData.gameId])
        gameIdIntervalMap[moveData.gameId] = setTimeout(() => dispatch(gamePlay.claimWinTimeout(moveData.gameId)), claimTimeoutWindow)
        dispatch(gamePlay.nextMoveReceived(moveData))
    }
}

export const challengeAcceptedTimeout = gameData => {
    return dispatch => {
        clearInterval(gameIdIntervalMap[gameData.gameId])
        gameIdIntervalMap[gameData.gameId] = setTimeout(() => dispatch(gamePlay.claimWinTimeout(gameData.gameId)), claimTimeoutWindow)
        dispatch(gamePlay.challengeAccepted(gameData))
    }
}

export const newGame = players => {
    return dispatch => {
        dispatch(clearError())
        return Connect4Web3.newGame(players.opponent)
            .then(transactionHash => dispatch(gamePlay.newGameReceipt("New Game", new Date(), transactionHash)))
            .catch(err => dispatch(globalErrorAction(err)))
    }
}

export const nextMove = moveData => {
    return (dispatch, getState) => {
        dispatch(clearError())
        return Connect4Web3.takeTurn(moveData.gameId, moveData.column)
            .then(transactionHash => {
                possiblyDispatchPendingMove(getState(), dispatch, moveData)
                dispatch(gamePlay.statusAppend(moveData.gameId, "Next Move", new Date(), transactionHash))
            })
            .catch(err => dispatch(globalErrorAction(err)))
    }
}

export const resignGame = resignData => {
    return (dispatch, getState) => {
        dispatch(clearError())
        return Connect4Web3.resignGame(resignData.gameId)
            .then(transactionHash => {
                possiblyDispatchPendingMoveIfGameNotOver(getState(), dispatch, resignData)
                dispatch(gamePlay.statusAppend(resignData.gameId, "Resigned", new Date(), transactionHash))
            })
            .catch(err => dispatch(globalErrorAction(err)))
    }
}

export const claimWin = gameData => {
    return (dispatch, getState) => {
        dispatch(clearError())
        return Connect4Web3.claimWin(gameData.gameId)
            .then(transactionHash => {
                possiblyDispatchPendingMoveIfGameNotOver(getState(), dispatch, gameData)
                dispatch(gamePlay.statusAppend(gameData.gameId, "Win claimed", new Date(), transactionHash))
            })
            .catch(err => dispatch(globalErrorAction(err)))
    }
}
