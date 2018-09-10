import React, { Component } from "react"
import { connect } from "react-redux"
import { selectedGridCol, highlightedGridCol, nextMove, boardDeselect } from "../actions"

import "./Board.css"

const moveToString = move => {
    return `${move.row}.${move.col}`
}

const mapStoreToProps = store => {
    return {
        boardHeight: store.gamePlay.boardDef.height,
        boardWidth: store.gamePlay.boardDef.width,
        tileSize: store.gamePlay.boardDef.tileSize,
        hCol: store.board.highlightedCol,
        sCol: store.board.selectedCol,
        gameId: store.gamePlay.game.gameId,
        winner: store.gamePlay.game.winner,
        playerMove: store.gamePlay.game.playerMove,
        playerMoves: new Set(store.gamePlay.game.playerMoves.map(moveToString)),
        opponentMoves: new Set(store.gamePlay.game.opponentMoves.map(moveToString)),
        player: store.pageUI.accounts.player
    }
}

class Board extends Component {
    selectColumn(col) {
        this.props.dispatch(selectedGridCol(col))
    }

    highlightColumn(col) {
        this.props.dispatch(highlightedGridCol(col))
    }

    boardMouseLeave() {
        this.props.dispatch(boardDeselect())
    }

    takeTurn() {
        const moveData = {
            gameId: this.props.gameId,
            column: this.props.sCol,
            player: this.props.player
        }

        this.props.dispatch(nextMove(moveData))
    }

    makeTile(index, row, col, tileSize) {
        const move = moveToString({row: 5 - row, col})
        let cName = "r_off"
        if (this.props.playerMoves.has(move)) {
            cName = "r_usr"
        } else if (this.props.opponentMoves.has(move)) {
            cName = "r_opp"
        } else if (this.props.sCol === col) {
            cName = "r_select"
        } else if (this.props.hCol === col) {
            cName = "r_on"
        }

        const xMargin = (col % this.props.boardWidth ? 5 : 0) * col
        const yMargin = (row % this.props.boardHeight ? 5 : 0) * row
        return (
            <circle key={index} className={cName} cx={(col * tileSize * 2) + tileSize + xMargin} cy={(row * tileSize * 2) + tileSize + yMargin} r={tileSize}
                onClick={e => this.selectColumn(col)} onMouseOver={e => this.highlightColumn(col)}/>
        )
    }

    buildGrid(height, width, tileSize) {
        const tiles = []
        let index = 0
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                tiles.push(this.makeTile(index++, i, j, tileSize))
            }
        }

        return (tiles)
    }

    render() {
        const { boardHeight, boardWidth, tileSize, gameId, playerMove, player, winner } = this.props
        if (gameId === null) {
            return (<div>Waiting for a game to begin. Try challenging someone...!</div>)
        }

        let control
        if (winner) {
            control = <div><span>Game over -- you {winner === player ? "win!" : "lose!"}</span></div>
        } else if (playerMove) {
            control = (
                <div>
                    <div>
                        Your move, select a column.
                    </div>
                    <button id="btnTurn" onClick={e => this.takeTurn()}>Move</button>
                </div>
            )
        } else {
            control = <div>Waiting for opponent...</div>
        }

        return (
            <div>
                <svg id="grid" alt="SVG not supported by your browser" xmlns="http://www.w3.org/2000/svg"
                    width={(boardWidth * tileSize * 2) + boardWidth * 5} height={(boardHeight * tileSize * 2) + boardHeight * 5} onMouseLeave={e => this.boardMouseLeave()}>
                    {this.buildGrid(boardHeight, boardWidth, tileSize)}
                </svg>
                {control}
            </div>
        )
    }
}

export default connect(mapStoreToProps)(Board)
