import React, { Component } from "react"
import { connect } from "react-redux"

import HeaderBar from "./HeaderBar"
import Challenger from "./Challenger"
import Board from "./Board"
import Status from "./Status"
//HACK
import { initialiseWeb3, statusAppend, newGameBegin } from "../actions"

import "./App.css"

class App extends Component {
    componentDidMount() {
        this.props.dispatch(initialiseWeb3())

        // hack
        this.props.dispatch(statusAppend("New Game", new Date(), "0x07Bd15Ffe8094e7cf8B958746BD5c392a51a9FaFverylongstring"))
        this.props.dispatch(newGameBegin({gameId: 1, player: "foo", opponent: "bar", playerMove: true}))
    }

    render() {
        return (
            <div>
                <HeaderBar/>
                <Challenger/>
                <div id="gameContainer">
                    <Board/>
                    <Status/>
                </div>
            </div>
        )
    }
}

export default connect()(App)
