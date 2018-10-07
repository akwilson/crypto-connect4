import React, { Component } from "react"
import { connect } from "react-redux"
import BoardControl from "./BoardControl"
import { selectedGridCol, highlightedGridCol, boardDeselect } from "../actions/board"

import logo from "../connect4.svg"
import "./Board.css"

const moveToString = move => {
    return `${move.row}.${move.col}`
}

const mapStoreToProps = store => {
    const selectedGame = store.gamePlay.selectedGame
    const game = selectedGame && store.gamePlay.games ? store.gamePlay.games[selectedGame] : null

    return {
        ...game,

        boardHeight: store.gamePlay.boardDef.height,
        boardWidth: store.gamePlay.boardDef.width,
        tileMargin: store.gamePlay.boardDef.tileMargin,
        tileSize: store.gamePlay.boardDef.tileSize,

        pendingStart: store.gamePlay.pendingStart,

        sCol: store.board.selectedCol,
        hCol: store.board.highlightedCol,

        player: store.pageUI.accounts.player
    }
}

class Board extends Component {
    selectColumn(col) {
        if (col === this.props.sCol) {
            this.props.dispatch(selectedGridCol(null))
        } else {
            const p1 = this.props.player1Moves.filter(m => m.col === col)
            const p2 = this.props.player2Moves.filter(m => m.col === col)
            if (p1.length + p2.length < this.props.boardHeight) {
                this.props.dispatch(selectedGridCol(col))
            }
        }
    }

    highlightColumn(col) {
        this.props.dispatch(highlightedGridCol(col))
    }

    boardMouseLeave() {
        this.props.dispatch(boardDeselect())
    }

    makeTile(index, row, col, player1MovesSet, player2MovesSet) {
        const { tileSize, tileMargin, boardHeight, boardWidth, sCol, hCol } = this.props

        // Flip row value so that tiles stack up from the bottom of the board 
        const move = moveToString({row: (boardHeight - 1) - row, col})
        let cName = "r_off"
        if (player1MovesSet.has(move)) {
            cName = "r_p1"
        } else if (player2MovesSet.has(move)) {
            cName = "r_p2"
        } else if (sCol === col) {
            cName = "r_select"
        } else if (hCol === col) {
            cName = "r_on"
        }

        const colMargin = (col % boardWidth ? tileMargin : 0) * col
        const rowMargin = (row % boardHeight ? tileMargin : 0) * row
        return (
            <circle key={index} className={"clicker " + cName} cx={(col * tileSize * 2) + tileSize + colMargin}
                cy={(row * tileSize * 2) + tileSize + rowMargin} r={tileSize}
                onClick={e => this.selectColumn(col)} onMouseOver={e => this.highlightColumn(col)}/>
        )
    }

    buildGrid() {
        const { boardWidth, boardHeight } = this.props
        const player1MovesSet = new Set(this.props.player1Moves.map(moveToString))
        const player2MovesSet = new Set(this.props.player2Moves.map(moveToString))
        const tiles = []

        let index = 0
        for (let i = 0; i < boardHeight; i++) {
            for (let j = 0; j < boardWidth; j++) {
                tiles.push(this.makeTile(index++, i, j, player1MovesSet, player2MovesSet))
            }
        }

        return (tiles)
    }

    render() {
        const { boardHeight, boardWidth, tileSize, gameId, tileMargin, pendingStart } = this.props
        if (!gameId) {
            if (pendingStart) {
                return (
                    <div className="alert alert-info pend-msg row no-gutters">
                        <div className="my-auto">
                            <h5>
                                <img className="App-logo" src={logo} width="20" height="20" alt="Spinnng Connect 4 Logo"/>
                                <span className="ml-3">Waiting for game start confirmation...</span>
                            </h5>
                        </div>
                    </div>
                )
            }

            return null
        }

        return (
            <div>
                <div className="row no-gutters mb-3">
                    <svg id="grid" alt="SVG not supported by your browser" xmlns="http://www.w3.org/2000/svg"
                        width={(boardWidth * tileSize * 2) + boardWidth * tileMargin}
                        height={(boardHeight * tileSize * 2) + boardHeight * tileMargin}
                        onMouseLeave={e => this.boardMouseLeave()}>
                        {this.buildGrid()}
                    </svg>
                </div>
                <div className="row no-gutters">
                    <BoardControl/>
                </div>
            </div>
        )
    }
}

export default connect(mapStoreToProps)(Board)
