import React, { Component } from "react"
import Board from "./Board"
import Status from "./Status"

import "./GameContainer.css"

class GameContainer extends Component {
    render() {
        return (
            <div id="gameContainer">
                <Board/>
                <Status/>
            </div>
        )
    }
}

export default GameContainer
