import React, { Component } from "react"
import { connect } from "react-redux"

const mapStateToProps = state => { return { accounts: state.accounts } }

class Challenger extends Component {
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
                	<input id="oppAccount" type="text"></input>
                	<button id="btnNew" className="bc2">Challenge</button>
            	</div>
        	</fieldset>
        )
    }
}

export default connect(mapStateToProps)(Challenger)
