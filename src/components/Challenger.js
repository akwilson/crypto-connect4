import React, { Component } from "react"
import { connect } from "react-redux"
import Web3 from "web3"
import { opponentChange, newGame } from "../actions"

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
            <div className="mb-2">
                <form>
                    <h5>New Game</h5>
                    <div className="row no-gutters form-group my-0">
                        <label className="col-2">Your Account</label>
                        <span className="col-10 px-1">{accounts.player}</span>
                    </div>
                    <div className="row no-gutters form-group my-0">
                        <label className="sr-only" for="oppo">Opponent Account</label>
                        <input className="col-2 form-control-plaintext form-control-sm" id="oppo" readonly type="text" value="Opponent Account"></input>
                        <input className="col-4 form-control form-control-sm px-1" type="text" onChange={e => this.opponentChange(e.target.value)}
                            value={accounts.opponent} placeholder="0x1234..."></input>
                        <button className="col-1 btn btn-sm btn-primary mx-2 py-0" onClick={e => this.doChallenge()} disabled={!this.isChallengable()}>Challenge</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default connect(mapStateToProps)(Challenger)
