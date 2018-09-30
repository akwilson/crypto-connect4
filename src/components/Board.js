import React, { Component } from "react"
import { connect } from "react-redux"
import BoardControl from "./BoardControl"
import { selectedGridCol, highlightedGridCol, nextMove, boardDeselect, resignGame, claimWin } from "../actions"

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

    takeTurn = () => {
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

    claimWin() {
        if (window.confirm("Claim win, are you sure?")) {
            this.props.dispatch(claimWin({
                player: this.props.player,
                gameId: this.props.gameId
            }))
        }
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
            <circle key={index} className={cName} cx={(col * tileSize * 2) + tileSize + colMargin}
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

    isGameOver() {
        const { winner, resigner, isDraw } = this.props
        return winner || resigner || isDraw
    }

    isClaimable() {
        const { isClaimable, isPlayer1Next, player, player1, player2 } = this.props
        return !this.isGameOver() && isClaimable && ((!isPlayer1Next && (player === player1)) || (isPlayer1Next && (player === player2)))
    }

    render() {
        const { boardHeight, boardWidth, tileSize, gameId, player, player1, player2, isPlayer1Next, sCol, tileMargin, winner, resigner } = this.props
        if (!gameId) {
            return null
        }

        return (
            <div>
                <div className="mb-1">
                    <svg alt="SVG not supported by your browser" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                        <circle className={player === player1 ? "r_p2" : "r_p1"} cx="10" cy="10" r="10"/>
                    </svg>
                    <span className="ml-2 align-middle">Opponent is {player === player1 ? player2 : player1}</span>
                </div>
                <div className="row no-gutters mb-3">
                    <button className="col-2 btn btn-primary btn-sm" onClick={e => this.claimWin()} disabled={!this.isClaimable()}>Claim Win</button>
                    <button className="col-2 btn btn-primary btn-sm ml-1" onClick={e => this.resignGame()} disabled={this.isGameOver()}>Resign</button>
                </div>
                <div className="row no-gutters mb-2">
                    <svg id="grid" alt="SVG not supported by your browser" xmlns="http://www.w3.org/2000/svg"
                        width={(boardWidth * tileSize * 2) + boardWidth * tileMargin}
                        height={(boardHeight * tileSize * 2) + boardHeight * tileMargin}
                        onMouseLeave={e => this.boardMouseLeave()}>
                        {this.buildGrid()}
                    </svg>
                </div>
                <div className="row no-gutters">
                    <BoardControl isGameOver={this.isGameOver()}
                                  isPlayerNext={((isPlayer1Next && (player === player1)) || (!isPlayer1Next && (player === player2)))}
                                  isColSelected={sCol !== null} player={player} winner={winner} resigner={resigner}
                                  isPlayer1={player === player1}
                                  takeTurn={this.takeTurn}/>
                </div>
            </div>
        )
    }
}

export default connect(mapStoreToProps)(Board)
