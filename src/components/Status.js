import React, { Component } from "react"
import { connect } from "react-redux"
import dateFormat from "dateformat"

const mapStateToProps = store => {
    const selectedGame = store.gamePlay.selectedGame
    const game = selectedGame && store.gamePlay.games ? store.gamePlay.games[selectedGame] : null
    const gameId = game ? game.gameId : null
    const pendingStart = store.gamePlay.pendingStart

    if (!gameId && pendingStart && pendingStart.message) {
        return { statusMessages: [ pendingStart ] }
    }

    return {
        statusMessages: game ? game.statusMessages : []
    }
}

class Status extends Component {
    buildStatusTable(statusMessages) {
        if (!statusMessages.length) {
            return null
        }

        let index = 0
        const sms = statusMessages.map(msg => <tr className="small-text" key={index++}><td>{msg.sType}</td>
            <td>{dateFormat(msg.date, "HH:MM:ss")}</td><td>{msg.message}</td></tr>)

        return (
            <table className="table table-sm table-borderless">
                <thead>
                    <tr>
                        <th colSpan="3">Transaction Receipts</th>
                    </tr>
                    <tr className="small-text">
                        <th scope="col">Move</th>
                        <th scope="col">Timestamp</th>
                        <th scope="col">Receipt</th>
                    </tr>
                </thead>
                <tbody>
                    {sms}
                </tbody>
            </table>
        )
    }

    render() {
        const { statusMessages } = this.props

        return (
            <div className="ml-3 w-60">
                <div>
                    {this.buildStatusTable(statusMessages)}
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps)(Status)
