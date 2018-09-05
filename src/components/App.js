import React, { Component } from "react"
import HeaderBar from "./HeaderBar"
import Challenger from "./Challenger"
import Board from "./Board"
import {web3Init} from "../actions"
import Connect4Web3 from "../Connect4Web3"

class App extends Component {
    componentDidMount() {
        Connect4Web3.init().then(accounts => this.props.dispatch(web3Init(accounts)))
    }

    render() {
        return (
            <div className="App">
            <HeaderBar/>
            <Challenger/>
            <Board/>
            </div>
        )
    }
}

export default App
