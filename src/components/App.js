import React, { Component } from "react"
import { connect } from "react-redux"
import HeaderBar from "./HeaderBar"
import Challenger from "./Challenger"
import Board from "./Board"
import Status from "./Status"
import { web3Init, errorAction } from "../actions"
import Connect4Web3 from "../Connect4Web3"

class App extends Component {
    componentDidMount() {
        Connect4Web3.init()
            .then(accounts => this.props.dispatch(web3Init(accounts)))
            .catch(err => this.props.dispatch(errorAction(err)))
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
