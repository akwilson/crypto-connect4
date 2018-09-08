import EventEmitter from "events"
import Web3 from "web3"
import Connect4Contract from "Connect4"

const connect4Address = "0x5a7d0aaaa9f1eba23f22da09012f877fdf7549ee"

class Connect4Web3 extends EventEmitter {
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
            	this._registerEvents(accounts[0])
				return accounts
        	})
	}

	_registerEvents(accountId) {
    	const web3jsEvents = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"))
    	const connect4Events = new web3jsEvents.eth.Contract(Connect4Contract.abi, connect4Address)

    	function newGameOk(event, playerMove) {
        	const res = event.returnValues
        	console.log(`EVENT: NewGame Id: ${res.gameId} P1: ${res.player1} P2: ${res.player2}`)
            return {
                gameId: res.gameId,
                player: accountId,
                opponent: res.player1 === accountId ? res.player2 : res.player1,
                playerMove
            }
    	}

    	connect4Events.events.NewGame({filter: {player1: accountId}})
        	.on("data", event => {
            	const ngd = newGameOk(event, true)
				this.emit("NEW_GAME_OK", ngd)
        	})
        	.on("error", err => {
				console.error("EVENT NewGame ERROR: " + err)
				this.emit("GAME_ERROR", err)
			})

    	connect4Events.events.NewGame({filter: {player2: accountId}})
        	.on("data", event => {
            	console.log("PLAYER2")
            	const ngd = newGameOk(event, false)
				this.emit("NEW_GAME_OK", ngd)
        	})
        	.on("error", err => {
				console.error("EVENT NewGame ERROR: " + err)
				this.emit("GAME_ERROR", err)
			})

        // TODO: filter on gameId
        connect4Events.events.NextMove()
            .on("data", event => {
                const res = event.returnValues
                console.log(`EVENT NextMove Id: ${res.gameId} player: ${res.player} X: ${res.x} Y: ${res.y}`)
                const moveData = {
                    gameId: res.gameId,
                    player: res.player,
                    x: Number(res.x),
                    y: Number(res.y),
                    playerMove: res.player !== accountId
                }

                this.emit("NEXT_MOVE_OK", moveData)
            })
            .on("error", err => {
                console.error("EVENT NextMove ERROR: " + err)
                this.emit("GAME_ERROR", err)
            })

        // TODO: filter on gameId
        connect4Events.events.GameOver()
            .on("data", event => {
                const res = event.returnValues
                console.log(`EVENT GameOver Id: ${res.gameId} Winner: ${res.winner}`)
                this.emit("GAME_OVER_OK", res)
            })
            .on("error", err => {
                console.error("EVENT GameOver ERROR: " + err)
                this.emit("GAME_ERROR", err)
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
}

export default new Connect4Web3()
