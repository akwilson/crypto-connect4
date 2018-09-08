import React, { Component } from "react"
import { connect } from "react-redux"
import { opponentChange, newGame } from "../actions"

const mapStateToProps = state => {
    return { accounts: state.pageUI.accounts }
}

class Challenger extends Component {
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
            	<legend>Game</legend>
            	<div>
                	<label className="block">Your Account</label>
                	<span id="userAccount">{accounts.player}</span>
            	</div>
            	<div className="row2">
                	<label className="block">Opponent Account</label>
                	<input id="oppAccount" type="text" onChange={e => this.opponentChange(e.target.value)} value={accounts.opponent}></input>
                	<button id="btnNew" className="bc2" onClick={e => this.doChallenge()}>Challenge</button>
            	</div>
        	</fieldset>
        )
    }
}

export default connect(mapStateToProps)(Challenger)
