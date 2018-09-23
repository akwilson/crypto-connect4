import React, { Component } from "react"
import { connect } from "react-redux"
import dateFormat from "dateformat"

const mapStateToProps = store => {
    const selectedGame = store.gamePlay.selectedGame
    const game = selectedGame && store.gamePlay.games ? store.gamePlay.games[selectedGame] : null

    return {
        errorMessage: game ? game.errorMessage : "",
        statusMessages: game ? game.statusMessages : []
    }
}

class Status extends Component {
    buildStatusTable(statusMessages) {
        if (!statusMessages.length) {
            return null
        }

        let index = 0
        const sms = statusMessages.map(msg => <tr key={index++}><td className="tdbuff">{msg.sType}</td>
            <td className="tdbuff">{dateFormat(msg.date, "HH:MM:ss")}</td><td>{msg.message}</td></tr>)

        return (
            <table>
                <thead>
                    <tr><th colSpan="3">Transaction Receipts</th></tr>
                </thead>
                <tbody>
                    {sms}
                </tbody>
            </table>
        )
    }

    render() {
        const { statusMessages, errorMessage } = this.props

        return (
            <div className="gcbuff">
                {this.buildStatusTable(statusMessages)}
                <div id="errorMsg">{errorMessage}</div>
            </div>
        )
    }
}

export default connect(mapStateToProps)(Status)
