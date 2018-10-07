import React, { Component } from "react"
import { connect } from "react-redux"

import HeaderBar from "./HeaderBar"
import Challenger from "./Challenger"
import BoardTabs from "./BoardTabs"
import GameContainer from "./GameContainer"
import { initialiseWeb3 } from "../actions/pageUI"

import "./App.css"

class App extends Component {
    componentDidMount() {
        this.props.dispatch(initialiseWeb3())
    }

    render() {
        return (
            <div className="container">
                <HeaderBar/>
                <Challenger/>
                <BoardTabs/>
                <GameContainer/>
            </div>
        )
    }
}

export default connect()(App)
