import React, { Component } from "react"
import { connect } from "react-redux"
import _ from "lodash"
import { switchGame } from "../actions/gamePlay"

import "./BoardTabs.css"

const mapStateToProps = state => {
    return {
        games: state.gamePlay.games,
        selectedGame: state.gamePlay.selectedGame,
        pendingStart: state.gamePlay.pendingStart,
        globalError: state.pageUI.globalError
    }
}

class BoardTabs extends Component {
    switch(id) {
        this.props.dispatch(switchGame(id))
    }

    render() {
        const { games, selectedGame, pendingStart, globalError } = this.props

        if (globalError) {
            return (
                <div className="alert alert-danger">
                    <h5>Something went wrong :-(</h5>
                    <hr></hr>
                    <span>{globalError}</span>
                </div>
            )
        }

        if (!games && !pendingStart) {
            return (
                <div className="mt-4 col-6 offset-3" >
                    <h5>Waiting for a game to begin. Try challenging someone!</h5>
                </div>
            )
        }

        const gameTabs = _.map(games, (v, k) => {
            const refClasses = `no-trans btn btn-link nav-link ${selectedGame === k ? "active" : ""}`
            return (
                <li key={k} className="nav-item">
                    <button className={refClasses} onClick={e => this.switch(k)}>{v.title}</button>
                </li>
            )
        })

        if (pendingStart) {
            const refClasses = `no-trans btn btn-link nav-link ${selectedGame === -1 ? "active" : ""}`
            gameTabs.push(
                <li key={gameTabs.length} className="nav-item">
                    <button className={refClasses} onClick={e => this.switch(-1)}>Pending...</button>
                </li>
            )
        }

        return (
            <div className="mb-3">
                <ul className="nav nav-tabs">
                    {gameTabs}
                </ul>
            </div>
        )
    }
}

export default connect(mapStateToProps)(BoardTabs)
