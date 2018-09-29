import EventEmitter from "events"
import Web3 from "web3"
import Connect4Contract from "Connect4"

const connect4Address = "0x15e29055faa7c7487e116eb8a78f6e191e306fa7"

function now() {
    return Math.round((new Date()).getTime() / 1000)
}

class Connect4Web3 extends EventEmitter {
    _newGameOk(event) {
        const res = event.returnValues
        console.log(`EVENT: NewGame Id: ${res.gameId} P1: ${res.player1} P2: ${res.player2}`)
        this._registerGameEvents(res.gameId)

        return {
            gameId: res.gameId,
            player1: res.player1,
            player2: res.player2
        }
    }

    _registerGameEvents(gameId) {
        this.connect4Events.events.NextMove({filter: { gameId }})
            .on("data", event => {
                const res = event.returnValues
                console.log(`EVENT NextMove Id: ${res.gameId} player: ${res.player} X: ${res.x} Y: ${res.y} p1n: ${res.isPlayer1Next}`)
                const moveData = {
                    gameId: res.gameId,
                    player: res.player,
                    x: Number(res.x),
                    y: Number(res.y),
                    isPlayer1Next: res.isPlayer1Next === null ? false : true
                }

                this.emit("NEXT_MOVE_OK", moveData)
            })
            .on("error", err => {
                console.error("EVENT NextMove ERROR: " + err)
                this.emit("GAME_ERROR", { gameId, err })
            })

        this.connect4Events.events.Victory({filter: { gameId }})
            .on("data", event => {
                const res = event.returnValues
                console.log(`EVENT Victory Id: ${res.gameId} Winner: ${res.winner}`)
                const gameData = {
                    gameId: res.gameId,
                    winner: res.winner
                }

                this.emit("GAME_OVER_OK", gameData)
            })
            .on("error", err => {
                console.error("EVENT Victory ERROR: " + err)
                this.emit("GAME_ERROR", { gameId, err })
            })

        this.connect4Events.events.Resigned({filter: { gameId }})
            .on("data", event => {
                const res = event.returnValues
                console.log(`EVENT Resigned Id: ${res.gameId} Resigner: ${res.resigner}`)
                const gameData = {
                    gameId: res.gameId,
                    resigner: res.resigner
                }

                this.emit("GAME_RESIGNED_OK", gameData)
            })
            .on("error", err => {
                console.error("EVENT Resigned ERROR: " + err)
                this.emit("GAME_ERROR", { gameId, err })
            })

        this.connect4Events.events.Draw({filter: { gameId }})
            .on("data", event => {
                const res = event.returnValues
                console.log(`EVENT Draw Id: ${res.gameId}`)
                this.emit("GAME_DRAW_OK", { gameId: res.gameId })
            })
            .on("error", err => {
                console.error("EVENT Draw ERROR: " + err)
                this.emit("GAME_ERROR", { gameId, err })
            })
    }

	_registerEvents() {
    	const web3jsEvents = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"))
    	this.connect4Events = new web3jsEvents.eth.Contract(Connect4Contract.abi, connect4Address)

    	this.connect4Events.events.NewGame({filter: {player1: this.accountId}})
        	.on("data", event => {
            	const ngd = this._newGameOk(event)
				this.emit("NEW_GAME_OK", ngd)
        	})
        	.on("error", err => {
				console.error("EVENT NewGame ERROR: " + err)
				this.emit("GAME_ERROR", { gameId: 999, err })
			})

    	this.connect4Events.events.NewGame({filter: {player2: this.accountId}})
        	.on("data", event => {
            	const ngd = this._newGameOk(event)
				this.emit("CHALLENGE_ACCEPTED", ngd)
        	})
        	.on("error", err => {
				console.error("EVENT NewGame ERROR: " + err)
				this.emit("GAME_ERROR", { gameId: 999, err })
			})
    }

    _readActiveGames(gameId, gameInfo, board) {
        const player1Moves = []
        const player2Moves = []
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === "1") {
                    player1Moves.push({ col: i, row: j })
                } else if (board[i][j] === "2") {
                    player2Moves.push({ col: i, row: j })
                }
            }
        }

        return {
            gameData: {
                gameId,
                player1: gameInfo.player1,
                player2: gameInfo.player2,
                isPlayer1Next: gameInfo.isPlayer1Next,
                player1Moves,
                player2Moves,
                isClaimable: gameInfo.claimTime <= now()
            }
        }
    }

    init() {
		if (typeof web3 !== "undefined") {
			this.web3js = new Web3(window.web3.currentProvider)
		} else {
			console.log("No web3? You should consider trying MetaMask!")
			return Promise.reject(new Error("Missing web3"))
		}

        try {
		    this.connect4 = new this.web3js.eth.Contract(Connect4Contract.abi, connect4Address)
        } catch (err) {
            return Promise.reject(err)
        }

		return this.web3js.eth.getAccounts()
        	.then(accounts => {
                this.accountId = accounts[0]
            	this._registerEvents()
				return accounts
        	})
	}

    getActiveGames() {
        return this.connect4.methods.getGamesByPlayer().call({from: this.accountId})
            .then(gameIds => {
                return Promise.all(gameIds.map(gameId => {
                    return Promise.all([
                        this.connect4.methods.games(gameId).call({from: this.accountId}),
                        this.connect4.methods.getBoard(gameId).call({from: this.accountId})
                    ]).then(res => {
                        this._registerGameEvents(gameId)
                        return this._readActiveGames(gameId, res[0], res[1])
                    })
                }))
            })
    }

    newGame(player, opponent) {
        return new Promise((resolve, reject) => {
            this.connect4.methods.newGame(player, opponent)
                .send({from: player})
                .on("receipt", receipt => {
                    console.log("NewGame txn OK")
                    console.log(receipt)
                    resolve(receipt)
                })
                .on("error", err => {
                    console.error("NewGame txn ERR")
                    console.error(err)
                    reject(err)
                })
        })
    }

    takeTurn(player, gameId, column) {
        return new Promise((resolve, reject) => {
            this.connect4.methods.takeTurn(gameId, column)
                .send({from: player})
                .on("receipt", receipt => {
                    console.log("TakeTurn txn OK")
                    console.log(receipt)
                    resolve(receipt)
                })
                .on("error", err => {
                    console.log("TakeTurn txn ERR")
                    console.error(err)
                    reject(err)
                })
        })
    }

    resignGame(player, gameId) {
        return new Promise((resolve, reject) => {
            this.connect4.methods.resignGame(gameId)
                .send({from: player})
                .on("receipt", receipt => {
                    console.log("Resigned txn OK")
                    console.log(receipt)
                    resolve(receipt)
                })
                .on("error", err => {
                    console.log("Resigned txn ERR")
                    console.error(err)
                    reject(err)
                })
        })
    }

    claimWin(player, gameId) {
        return new Promise((resolve, reject) => {
            this.connect4.methods.claimWin(gameId)
                .send({from: player})
                .on("receipt", receipt => {
                    console.log("ClaimWin txn OK")
                    console.log(receipt)
                    resolve(receipt)
                })
                .on("error", err => {
                    console.log("ClaimWin txn ERR")
                    console.error(err)
                    reject(err)
                })
        })
    }
}

export default new Connect4Web3()
