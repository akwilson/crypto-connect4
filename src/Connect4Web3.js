import EventEmitter from "events"
import Web3 from "web3"
import Connect4Contract from "Connect4"

const connect4Address = "0x5a7d0aaaa9f1eba23f22da09012f877fdf7549ee"

class Connect4Web3 extends EventEmitter {
    init() {
        // init web3
        // set up events to NewGame()
		// get accounts

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

    	function newGameOk(event) {
        	const res = event.returnValues
        	console.log(`EVENT: NewGame Id: ${res.gameId} P1: ${res.player1} P2: ${res.player2}`)
    	}

    	connect4Events.events.NewGame({filter: {player1: accountId}})
        	.on("data", event => {
            	newGameOk(event)
				this.emit("NEW_GAME_OK", event.returnValues)
        	})
        	.on("error", err => {
				console.error("EVENT NewGame ERROR: " + err)
				this.emit("NEW_GAME_ERROR", err)
			})

    	connect4Events.events.NewGame({filter: {player2: accountId}})
        	.on("data", event => {
            	console.log("PLAYER2")
            	newGameOk(event)
				this.emit("NEW_GAME_OK", event.returnValues)
        	})
        	.on("error", err => {
				console.error("EVENT NewGame ERROR: " + err)
				this.emit("NEW_GAME_ERROR", err)
			})
	}

    newGame(player1, player2) {
        // return promise
        // subscribe to NextTurn and GameOver for gameId
    }

    takeTurn(column) {
    }
}

export default new Connect4Web3()
