import React, { Component } from "react"
import "./Board.css"

class Board extends Component {
    render() {
        return (
			<div id="gdiv">
            	<svg id="grid" alt="SVG not supported by your browser" xmlns="http://www.w3.org/2000/svg">
					<rect className="r_off" x="0" y="0" width="45" height="45"/>
					<rect className="r_on" x="45" y="0" width="45" height="45"/>
            	</svg>
        		<div><button id="btnTurn">Move</button></div>
        		<div>Game ID: <span id="gameId"></span></div>
        	</div>
        )
    }
}

export default Board
