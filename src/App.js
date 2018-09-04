import React, { Component } from "react"
import HeaderBar from "./HeaderBar"
import Challenger from "./Challenger"
import Board from "./Board"

class App extends Component {
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
