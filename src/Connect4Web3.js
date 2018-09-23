import EventEmitter from "events"
import Web3 from "web3"
import Connect4Contract from "Connect4"

const connect4Address = "0xac99e37429d5d5907a19d1206bd98f6815768aab"

class Connect4Web3 extends EventEmitter {
    _newGameOk(event, playerMove) {
        const res = event.returnValues
        console.log(`EVENT: NewGame Id: ${res.gameId} P1: ${res.player1} P2: ${res.player2}`)
        this._registerGameEvents(res.gameId)

        return {
            gameId: res.gameId,
            player: this.accountId,
            opponent: res.player1 === this.accountId ? res.player2 : res.player1,
            playerMove
        }
    }

    _registerGameEvents(gameId) {
        this.connect4Events.events.NextMove({filter: { gameId }})
            .on("data", event => {
                const res = event.returnValues
                console.log(`EVENT NextMove Id: ${res.gameId} player: ${res.player} X: ${res.x} Y: ${res.y}`)
                const moveData = {
                    gameId: res.gameId,
                    player: res.player,
                    x: Number(res.x),
                    y: Number(res.y),
                    playerMove: res.player !== this.accountId
                }

                this.emit("NEXT_MOVE_OK", moveData)
            })
            .on("error", err => {
                console.error("EVENT NextMove ERROR: " + err)
                this.emit("GAME_ERROR", err)
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
                this.emit("GAME_ERROR", err)
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
                this.emit("GAME_ERROR", err)
            })

        this.connect4Events.events.Draw({filter: { gameId }})
            .on("data", event => {
                const res = event.returnValues
                console.log(`EVENT Draw Id: ${res.gameId}`)
                this.emit("GAME_DRAW_OK", { gameId: res.gameId })
            })
            .on("error", err => {
                console.error("EVENT Draw ERROR: " + err)
                this.emit("GAME_ERROR", err)
            })
    }

	_registerEvents() {
    	const web3jsEvents = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"))
    	this.connect4Events = new web3jsEvents.eth.Contract(Connect4Contract.abi, connect4Address)

    	this.connect4Events.events.NewGame({filter: {player1: this.accountId}})
        	.on("data", event => {
            	const ngd = this._newGameOk(event, true)
				this.emit("NEW_GAME_OK", ngd)
        	})
        	.on("error", err => {
				console.error("EVENT NewGame ERROR: " + err)
				this.emit("GAME_ERROR", err)
			})

    	this.connect4Events.events.NewGame({filter: {player2: this.accountId}})
        	.on("data", event => {
            	const ngd = this._newGameOk(event, false)
				this.emit("CHALLENGE_ACCEPTED", ngd)
        	})
        	.on("error", err => {
				console.error("EVENT NewGame ERROR: " + err)
				this.emit("GAME_ERROR", err)
			})
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
                    console.log("TakeTurn txn OK")
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
                    console.log("Resigned txn OK")
                    console.error(err)
                    reject(err)
                })
        })
    }
}

export default new Connect4Web3()
