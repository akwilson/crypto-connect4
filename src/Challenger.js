import React, { Component } from "react"

class Challenger extends Component {
    render() {
        return (
			<fieldset>
            	<legend>Game</legend>
            	<div>
                	<label className="block">Your Account</label>
                	<span id="userAccount"></span>
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

export default Challenger
