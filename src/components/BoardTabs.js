import React, { Component } from "react"
import { connect } from "react-redux"
import _ from "lodash"
import { switchGame } from "../actions"

const mapStateToProps = state => {
    return {
        games: state.gamePlay.games,
        selectedGame: state.gamePlay.selectedGame,
        pendingStart: state.gamePlay.pendingStart
    }
}

class BoardTabs extends Component {
    switch(id) {
        this.props.dispatch(switchGame(id))
    }

    render() {
        const { games, selectedGame, pendingStart } = this.props

        if (!games && !pendingStart) {
            return (<h4>Waiting for a game to begin. Try challenging someone...!</h4>)
        }

        const gameTabs = _.map(games, (v, k) => {
            const refClasses = `nav-link ${selectedGame === k ? "active" : ""}`
            return (
                <li key={k} className="nav-item">
                    <a className={refClasses} href="#" onClick={e => this.switch(k)}>{v.title}</a>
                </li>
            )
        })

        if (pendingStart) {
            const refClasses = `nav-link ${selectedGame === -1 ? "active" : ""}`
            gameTabs.push(
                <li key={gameTabs.length} className="nav-item">
                    <a className={refClasses} href="#" onClick={e => this.switch(-1)}>Pending...</a>
                </li>
            )
        }

		return (
        	<ul className="nav nav-tabs">
                {gameTabs}
        	</ul>
		)
    }
}

export default connect(mapStateToProps)(BoardTabs)
