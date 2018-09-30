import React, { Component } from "react"
import { connect } from "react-redux"

class BoardControl extends Component {
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
        const { isGameOver, isPlayerNext, isColSelected, isPlayer1 } = this.props

        if (isGameOver) {
            return this.makeGameOverDisplay()
        } else if (isPlayerNext) {
            return (
                <div>
                    <div className="mb-1">
                        <svg alt="SVG not supported by your browser" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                            <circle className={isPlayer1 ? "r_p1" : "r_p2"} cx="10" cy="10" r="10"/>
                        </svg>
                        <span className="ml-2 align-middle">Your move, select a column</span>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={e => this.props.takeTurn()} disabled={!isColSelected}>Move</button>
                </div>
            )
        } else {
            return <div>Waiting for opponent...</div>
        }
    }
}

export default BoardControl
