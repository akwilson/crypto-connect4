import React, { Component } from "react"
import { connect } from "react-redux"
import _ from "lodash"
import { switchGame } from "../actions"

const mapStateToProps = state => {
    return {
        games: state.gamePlay.games,
        selectedGame: state.gamePlay.selectedGame
    }
}

class BoardTabs extends Component {
    switch(id) {
        this.props.dispatch(switchGame(id))
    }

    render() {
        const { games, selectedGame } = this.props

        if (!games) {
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

		return (
        	<ul className="nav nav-tabs">
                {gameTabs}
        	</ul>
		)
    }

    /*
    render() {
        return (
            <div>
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item">
                        <a className="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Home</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">Profile</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" id="contact-tab" data-toggle="tab" href="#contact" role="tab" aria-controls="contact" aria-selected="false">Contact</a>
                    </li>
                </ul>

                <div className="tab-content" id="myTabContent">
                    <div className="tab-pane show active" id="home" role="tabpanel" aria-labelledby="home-tab">WIBBLE</div>
                    <div className="tab-pane" id="profile" role="tabpanel" aria-labelledby="profile-tab">WOBBLE</div>
                    <div className="tab-pane" id="contact" role="tabpanel" aria-labelledby="contact-tab">FOOBAR</div>
                </div>
            </div>
        )
    }
    */
}

export default connect(mapStateToProps)(BoardTabs)
