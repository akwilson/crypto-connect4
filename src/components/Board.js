import React, { Component } from "react"
import { connect } from "react-redux"

import "./Board.css"

const mapStoreToProps = store => {
    return {
        boardHeight: store.game.boardDef.height,
        boardWidth: store.game.boardDef.width,
        tileSize: store.game.boardDef.tileSize
    }
}

class Board extends Component {
    selectColumn(col) {
        console.log(col)
    }

    makeTile(index, row, col, tileSize) {
        return (
            <rect key={index} className="r_off" x={col * tileSize} y={row * tileSize} width={tileSize} height={tileSize}
                onClick={e => this.selectColumn(col)}/>
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
        const { boardHeight, boardWidth, tileSize } = this.props

        return (
            <div id="gdiv">
                <svg id="grid" alt="SVG not supported by your browser" xmlns="http://www.w3.org/2000/svg"
                    width={boardWidth * tileSize} height={boardHeight * tileSize}>
                    {this.buildGrid(boardHeight, boardWidth, tileSize)}
                </svg>
                <div><button id="btnTurn">Move</button></div>
                <div>Game ID: <span id="gameId"></span></div>
            </div>
        )
    }
}

export default connect(mapStoreToProps)(Board)
