import React, { Component } from "react"
import { connect } from "react-redux"
import { selectedGridCol, highlightedGridCol } from "../actions"

import "./Board.css"

const mapStoreToProps = store => {
    return {
        boardHeight: store.gamePlay.boardDef.height,
        boardWidth: store.gamePlay.boardDef.width,
        tileSize: store.gamePlay.boardDef.tileSize,
        hCol: store.board.highlightedCol,
        sCol: store.board.selectedCol,
        gameId: store.gamePlay.game.gameId,
        playerMove: store.gamePlay.game.playerMove
    }
}

class Board extends Component {
    selectColumn(col) {
        this.props.dispatch(selectedGridCol(col))
    }

    highlightColumn(col) {
        this.props.dispatch(highlightedGridCol(col))
    }

    makeTile(index, row, col, tileSize) {
        let cName = "r_off"
        if (this.props.sCol === col) {
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
        const { boardHeight, boardWidth, tileSize, gameId, playerMove } = this.props
        if (gameId === null) {
            return (
                <div>
                    Waiting for a game to begin. Try challenging someone...!
                </div>
            )
        }

        return (
            <div id="gdiv">
                <svg id="grid" alt="SVG not supported by your browser" xmlns="http://www.w3.org/2000/svg"
                    width={boardWidth * tileSize} height={boardHeight * tileSize}>
                    {this.buildGrid(boardHeight, boardWidth, tileSize)}
                </svg>
                <div><button id="btnTurn" disabled={!playerMove}>Move</button></div>
                <div>Game ID: <span id="gameId">{gameId}</span></div>
            </div>
        )
    }
}

export default connect(mapStoreToProps)(Board)
