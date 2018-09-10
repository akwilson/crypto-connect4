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

        return (
            <rect key={index} className={cName} x={col * tileSize} y={row * tileSize} width={tileSize} height={tileSize}
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
            return (<div id="gdiv">Waiting for a game to begin. Try challenging someone...!</div>)
        }

        let control
        if (winner) {
            control = <span>Game over -- you {winner === player ? "win!" : "lose!"}</span>
        } else {
            control = <button id="btnTurn" onClick={e => this.takeTurn()} disabled={!playerMove}>Move</button>
        }

        return (
            <div id="gdiv">
                <div id="tbuff">Game ID: <span id="gameId">{gameId}</span></div>
                <svg id="grid" alt="SVG not supported by your browser" xmlns="http://www.w3.org/2000/svg"
                    width={boardWidth * tileSize} height={boardHeight * tileSize} onMouseLeave={e => this.boardMouseLeave()}>
                    {this.buildGrid(boardHeight, boardWidth, tileSize)}
                </svg>
                <div>
                    {control}
                </div>
            </div>
        )
    }
}

export default connect(mapStoreToProps)(Board)
