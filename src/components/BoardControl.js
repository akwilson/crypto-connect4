import React, { Component } from "react"
import { connect } from "react-redux"
import { nextMove, resignGame, claimWin } from "../actions"

const mapStoreToProps = store => {
    const selectedGame = store.gamePlay.selectedGame
    const game = selectedGame && store.gamePlay.games ? store.gamePlay.games[selectedGame] : null

    return {
        ...game,
        selectedCol: store.board.selectedCol,
        player: store.pageUI.accounts.player
    }
}

class BoardControl extends Component {
    takeTurn() {
        const moveData = {
            gameId: this.props.gameId,
            column: this.props.selectedCol,
            player: this.props.player
        }

        this.props.dispatch(nextMove(moveData))
    }

    resignGame() {
        if (window.confirm("Resign game, are you sure?")) {
            this.props.dispatch(resignGame({
                player: this.props.player,
                gameId: this.props.gameId
            }))
        }
    }

    claimWin() {
        if (window.confirm("Claim win, are you sure?")) {
            this.props.dispatch(claimWin({
                player: this.props.player,
                gameId: this.props.gameId
            }))
        }
    }

    isGameOver() {
        const { winner, resigner, isDraw } = this.props
        return winner || resigner || isDraw
    }

    isClaimable() {
        const { isClaimable, isPlayer1Next, player, player1, player2 } = this.props
        return !this.isGameOver() && isClaimable && ((!isPlayer1Next && (player === player1)) || (isPlayer1Next && (player === player2)))
    }

    makeGameOverDisplay() {
        const { player, winner, resigner } = this.props

        if (winner) {
            return <div>Game over -- you {winner === player ? "win!" : "lose!"}</div>
        } else if (resigner) {
            return <div>Game over -- you {resigner !== player ? "win!" : "lose!"} {resigner !== player ? "Opponent" : "You"} resigned.</div>
        } 

        return <div>Game drawn!</div>
    }

    render() {
        const { player, player1, player2, isPlayer1Next, selectedCol } = this.props
        const isGameOver = this.isGameOver()
        const isPlayerNext = ((isPlayer1Next && (player === player1)) || (!isPlayer1Next && (player === player2)))
        const isPlayer1 = player === player1
        const isColSelected = selectedCol !== null

        if (isGameOver) {
            return this.makeGameOverDisplay()
        }

        return (
            <div className={"w-100 alert alert-" + (isPlayerNext ? "primary" : "secondary")}>
                <div className="mb-2">
                    <svg alt="SVG not supported by your browser" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                        <circle className={isPlayer1 ? "r_p2" : "r_p1"} cx="10" cy="10" r="10"/>
                    </svg>
                    <span className="ml-2 align-middle">Opponent is {isPlayer1 ? player2 : player1}</span>
                </div>
                <div className="mb-2">
                    <svg alt="SVG not supported by your browser" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                        <circle className={isPlayer1 ? "r_p1" : "r_p2"} cx="10" cy="10" r="10"/>
                    </svg>
                    <span className="ml-2 align-middle">{isPlayerNext ? "Your move, select a column" : "Waiting for opponent..."}</span>
                </div>
                <div className="row no-gutters">
                    <button className="col-2 btn btn-primary btn-sm" onClick={e => this.claimWin()} disabled={!this.isClaimable()}>Claim Win</button>
                    <button className="col-2 btn btn-primary btn-sm ml-1" onClick={e => this.resignGame()} disabled={isGameOver}>Resign</button>
                    <button className="col-2 btn btn-primary btn-sm ml-1" onClick={e => this.takeTurn()} disabled={!isPlayerNext || !isColSelected}>Move</button>
                </div>
            </div>
        )
    }
}

export default connect(mapStoreToProps)(BoardControl)
