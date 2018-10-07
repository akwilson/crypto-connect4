import Connect4Web3 from "../Connect4Web3"
import * as gamePlay from "./gamePlay"
import { clearError, globalErrorAction } from "./pageUI"

const gameIdIntervalMap = {}
const claimTimeoutWindow = 1800000

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
    return dispatch => {
        dispatch(clearError())
        return Connect4Web3.takeTurn(moveData.gameId, moveData.column)
            .then(transactionHash => {
                dispatch(gamePlay.pendingMove(moveData))
                dispatch(gamePlay.statusAppend(moveData.gameId, "Next Move", new Date(), transactionHash))
            })
            .catch(err => dispatch(globalErrorAction(err)))
    }
}

export const resignGame = resignData => {
    return dispatch => {
        dispatch(clearError())
        return Connect4Web3.resignGame(resignData.gameId)
            .then(transactionHash => {
                dispatch(gamePlay.pendingMove(resignData))
                dispatch(gamePlay.statusAppend(resignData.gameId, "Resigned", new Date(), transactionHash))
            })
            .catch(err => dispatch(globalErrorAction(err)))
    }
}

export const claimWin = gameData => {
    return dispatch => {
        dispatch(clearError())
        return Connect4Web3.claimWin(gameData.gameId)
            .then(transactionHash => {
                dispatch(gamePlay.pendingMove(gameData))
                dispatch(gamePlay.statusAppend(gameData.gameId, "Win claimed", new Date(), transactionHash))
            })
            .catch(err => dispatch(globalErrorAction(err)))
    }
}
