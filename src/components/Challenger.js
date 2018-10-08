import React, { Component } from "react"
import { connect } from "react-redux"
import Web3 from "web3"
import { opponentChange } from "../actions/pageUI"
import { newGame } from "../actions/gamePlayThunks"

const mapStoreToProps = store => {
    return {
        accounts: store.pageUI.accounts,
        isPendingStart: store.gamePlay.pendingStart !== null
    }
}

function isValidOpponent(opponent, player) {
    return opponent && opponent !== player && Web3.utils.isAddress(opponent)
}

class Challenger extends Component {
    isChallengable() {
        const { accounts, isPendingStart } = this.props
        if (isPendingStart) {
            return false
        }

        return isValidOpponent(accounts.opponent, accounts.player)
    }

    doChallenge() {
        this.props.dispatch(newGame(this.props.accounts))
    }

    opponentChange(oppValue) {
        this.props.dispatch(opponentChange(oppValue))
    }

    render() {
        const accounts = this.props.accounts

        if (!accounts.player) {
            return  (
                <div className="alert alert-info mb-2">
                    <h5>Welcome to Crypto Connect 4</h5>
                    <hr></hr>
                    <span>Unlock a MetaMask wallet to begin</span>
                </div>
           )
        }

        return (
            <div className="card mb-2">
                <div className="card-body">
                    <form>
                        <div className="row no-gutters form-group">
                            <span className="col-2">Your Account</span>
                            <span className="col-10 px-2">{accounts.player}</span>
                        </div>
                        <div className="row no-gutters form-group my-0">
                            <label className="sr-only" htmlFor="oppo">Opponent Account</label>
                            <input className="col-2 form-control-plaintext" id="oppo" readOnly type="text" value="Opponent Account"></input>
                            <input className="col-5 form-control px-2" type="text" onChange={e => this.opponentChange(e.target.value)}
                                value={accounts.opponent} placeholder="0x1234..."></input>
                            <button className="col-1 btn btn-sm btn-primary mx-2 py-0" type="button" onClick={e => this.doChallenge()} disabled={!this.isChallengable()}>Challenge</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default connect(mapStoreToProps)(Challenger)
