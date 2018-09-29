import React, { Component } from "react"
import Board from "./Board"
import Status from "./Status"

//import "./GameContainer.css"

class GameContainer extends Component {
    render() {
        return (
            <div className="row no-gutters">
                <Board className="col-sm"/>
                <Status className="col-sm"/>
            </div>
        )
    }
}

export default GameContainer
