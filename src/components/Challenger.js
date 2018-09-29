import React, { Component } from "react"
import { connect } from "react-redux"
import Web3 from "web3"
import { opponentChange, newGame } from "../actions"

import "./Challenger.css"

const mapStateToProps = state => {
    return { accounts: state.pageUI.accounts }
}

class Challenger extends Component {
    isChallengable() {
        const opponent = this.props.accounts.opponent
        return opponent && opponent !== this.props.accounts.player && Web3.utils.isAddress(opponent)
    }

    doChallenge() {
        this.props.dispatch(newGame(this.props.accounts))
    }

    opponentChange(oppValue) {
        this.props.dispatch(opponentChange(oppValue))
    }

    render() {
        const accounts = this.props.accounts

        return (
            <fieldset>
                <legend>New Game</legend>
                <div>
                    <label className="block">Your Account</label>
                    <span id="userAccount">{accounts.player}</span>
                </div>
                <div className="row2">
                    <label className="block">Opponent Account</label>
                    <input id="oppAccount" type="text" onChange={e => this.opponentChange(e.target.value)}
                           size="45" value={accounts.opponent}></input>
                    <button id="btnNew" className="bc2" onClick={e => this.doChallenge()} disabled={!this.isChallengable()}>Challenge</button>
                </div>
            </fieldset>
        )
    }
}

export default connect(mapStateToProps)(Challenger)
