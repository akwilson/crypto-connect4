import React, { Component } from "react"
import { connect } from "react-redux"
import { selectedGridCol, highlightedGridCol, nextMove, boardDeselect, resignGame } from "../actions"

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
            const pc = this.props.playerMoves.filter(m => m.col === col)
            const oc = this.props.opponentMoves.filter(m => m.col === col)
            if (pc.length + oc.length < this.props.boardHeight) {
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

    takeTurn() {
        const moveData = {
            gameId: this.props.gameId,
            column: this.props.sCol,
            player: this.props.player
        }

        this.props.dispatch(nextMove(moveData))
    }

    resignGame() {
        if (window.confirm("Resign game, are you sure?")) {
            this.props.dispatch(resignGame({
                player: this.props.player,
                gameId: this.props.gameId
            }))
        }
    }

    makeTile(index, row, col, playerMovesSet, opponentMovesSet) {
        const { tileSize, tileMargin, boardHeight, boardWidth, sCol, hCol } = this.props

        // Flip row value so that tiles stack up from the bottom of the board 
        const move = moveToString({row: (boardHeight - 1) - row, col})
        let cName = "r_off"
        if (playerMovesSet.has(move)) {
            cName = "r_usr"
        } else if (opponentMovesSet.has(move)) {
            cName = "r_opp"
        } else if (sCol === col) {
            cName = "r_select"
        } else if (hCol === col) {
            cName = "r_on"
        }

        const colMargin = (col % boardWidth ? tileMargin : 0) * col
        const rowMargin = (row % boardHeight ? tileMargin : 0) * row
        return (
            <circle key={index} className={cName} cx={(col * tileSize * 2) + tileSize + colMargin}
                cy={(row * tileSize * 2) + tileSize + rowMargin} r={tileSize}
                onClick={e => this.selectColumn(col)} onMouseOver={e => this.highlightColumn(col)}/>
        )
    }

    buildGrid() {
        const { boardWidth, boardHeight } = this.props
        const playerMovesSet = new Set(this.props.playerMoves.map(moveToString))
        const opponentMovesSet = new Set(this.props.opponentMoves.map(moveToString))
        const tiles = []

        let index = 0
        for (let i = 0; i < boardHeight; i++) {
            for (let j = 0; j < boardWidth; j++) {
                tiles.push(this.makeTile(index++, i, j, playerMovesSet, opponentMovesSet))
            }
        }

        return (tiles)
    }

    makeGameOverDisplay() {
        const { player, winner, resigner, isDraw } = this.props

        if (winner) {
            return <div>Game over -- you {winner === player ? "win!" : "lose!"}</div>
        } else if (resigner) {
            return <div>Game over -- you {resigner !== player ? "win!" : "lose!"} {resigner !== player ? "Opponent" : "You"} resigned.</div>
        } 

        return <div>Game drawn!</div>
    }

    isGameOver() {
        const { player, winner, resigner, isDraw } = this.props
        return winner || resigner || isDraw
    }

    render() {
        const { boardHeight, boardWidth, tileSize, gameId, playerMove, player, sCol, tileMargin } = this.props
        if (!gameId) {
            return null
        }

        let control
        if (this.isGameOver()) {
            control = this.makeGameOverDisplay()
        } else if (playerMove) {
            control = (
                <div>
                    <div>Your move, select a column.</div>
                    <button id="btnMove" onClick={e => this.takeTurn()} disabled={sCol === null}>Move</button>
                </div>
            )
        } else {
            control = <div>Waiting for opponent...</div>
        }

        return (
            <div>
                <div><button id="btnResign" onClick={e => this.resignGame()} disabled={this.isGameOver()}>Resign</button></div>
                <svg id="grid" alt="SVG not supported by your browser" xmlns="http://www.w3.org/2000/svg"
                    width={(boardWidth * tileSize * 2) + boardWidth * tileMargin}
                    height={(boardHeight * tileSize * 2) + boardHeight * tileMargin}
                    onMouseLeave={e => this.boardMouseLeave()}>
                    {this.buildGrid()}
                </svg>
                {control}
            </div>
        )
    }
}

export default connect(mapStoreToProps)(Board)
