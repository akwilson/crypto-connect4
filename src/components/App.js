import React, { Component } from "react"
import { connect } from "react-redux"

import HeaderBar from "./HeaderBar"
import Challenger from "./Challenger"
import Board from "./Board"
import Status from "./Status"
import { initialiseWeb3 } from "../actions"

class App extends Component {
    componentDidMount() {
        this.props.dispatch(initialiseWeb3())
    }

    render() {
        return (
            <div className="App">
                <HeaderBar/>
                <Challenger/>
                <Board/>
                <Status/>
            </div>
        )
    }
}

export default connect()(App)
