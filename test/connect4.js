const Connect4 = artifacts.require("./Connect4.sol")

contract('Connect4', accounts => {
    let instance

    beforeEach(async () => {
        instance = await Connect4.new()
    })

    contract("Play game", () => {
        it("should create a new game", async () => {
            const result = await instance.newGame(accounts[0], accounts[1])
            assert.equal(result.logs[0].event, "NewGame")
            assert.equal(result.logs[0].args.gameId.valueOf(), 0, "Game ID should be 0")
            assert.equal(result.logs[0].args.player1.valueOf(), accounts[0], "Wrong player1 address")
            assert.equal(result.logs[0].args.player2.valueOf(), accounts[1], "Wrong player2 address")

            const newGame = await instance.games(0)
            assert.equal(newGame[0], accounts[0], "Player 1 should equal the first account")
            assert.equal(newGame[1], accounts[1], "Player 2 should equal the second account")
            assert.equal(newGame[2], false, "New game should not be over")
            assert.equal(newGame[3], true, "Player 1 should be next")
        })
        it("should accept legal move", async () => {
            await instance.newGame(accounts[0], accounts[1])

            const result = await instance.takeTurn(0, 3)
            assert.equal(result.logs.length, 1)
            assert.equal(result.logs[0].event, "NextMove")
            assert.equal(result.logs[0].args.gameId.valueOf(), 0, "Game ID should be 0")
            assert.equal(result.logs[0].args.x.valueOf(), 3, "X should be 3")
            assert.equal(result.logs[0].args.y.valueOf(), 0, "Y should be 0")
            assert.equal(result.logs[0].args.isPlayer1Next.valueOf(), false, "Player2 should be next")

            const newGame = await instance.games(0)
            assert.equal(newGame[2], false, "New game should not be over")
            assert.equal(newGame[3], false, "Player 2 should be next")
        })
        it("should reject move outside board size", async () => {
            await instance.newGame(accounts[0], accounts[1])

            try {
                await instance.takeTurn(0, 9)
                assert.fail("Error not thrown")
            } catch (e) {
                assert.equal(e.message, "VM Exception while processing transaction: revert Illegal move")
            }
        })
        it("should reject if column is full", async () => {
            await instance.newGame(accounts[0], accounts[1])

            await instance.takeTurn(0, 0)
            await instance.takeTurn(0, 0, {from: accounts[1]})
            await instance.takeTurn(0, 0)
            await instance.takeTurn(0, 0, {from: accounts[1]})
            await instance.takeTurn(0, 0)
            await instance.takeTurn(0, 0, {from: accounts[1]})
            try {
                await instance.takeTurn(0, 0)
                assert.fail("Error not thrown")
            } catch (e) {
                assert.equal(e.message, "VM Exception while processing transaction: revert Column full")
            }
        })
        it("getBoard for single game", async () => {
            await instance.newGame(accounts[0], accounts[1])
            await instance.newGame(accounts[0], accounts[2])

            let result = await instance.getGamesByPlayer({from: accounts[0]})
            assert.equal(result.length, 2, "Player 1 should have two games")
            assert.equal(result[0], 0, "Player 1 plays in game 0")
            assert.equal(result[1], 1, "Player 1 plays in game 1")

            result = await instance.getGamesByPlayer({from: accounts[1]})
            assert.equal(result.length, 1, "Player 2 should have one game")
            assert.equal(result[0], 0, "Player 2 plays in game 0")

            result = await instance.getGamesByPlayer({from: accounts[2]})
            assert.equal(result.length, 1, "Player 3 should have one game")
            assert.equal(result[0], 1, "Player 3 plays in game 1")
        })
    })

    contract("Detect end game", () => {
        it("detect game complete, vertical", async () => {
            await instance.newGame(accounts[0], accounts[1])
            // used to test getGamesByPlayer()
            await instance.newGame(accounts[0], accounts[2])

            await instance.takeTurn(0, 0)
            await instance.takeTurn(0, 1, {from: accounts[1]})
            await instance.takeTurn(0, 0)
            await instance.takeTurn(0, 1, {from: accounts[1]})
            await instance.takeTurn(0, 0)
            await instance.takeTurn(0, 1, {from: accounts[1]})

            // test victory detection
            const result = await instance.takeTurn(0, 0)
            assert.equal(result.logs.length, 2)
            assert.equal(result.logs[0].event, "NextMove")
            assert.equal(result.logs[1].event, "Victory")
            assert.equal(result.logs[1].args.gameId.valueOf(), 0, "Game ID should be 0")
            assert.equal(result.logs[1].args.winner.valueOf(), accounts[0], "Wrong victor")

            // test getGamesByPlayer() after game completes
            let games = await instance.getGamesByPlayer({from: accounts[0]})
            assert.equal(games.length, 1, "Player 1 should have one game")
            assert.equal(games[0], 1, "Player 1 plays in game 1")

            games = await instance.getGamesByPlayer({from: accounts[1]})
            assert.equal(games.length, 0, "Player 2 should have no games")

            games = await instance.getGamesByPlayer({from: accounts[2]})
            assert.equal(games.length, 1, "Player 3 should have one game")
            assert.equal(games[0], 1, "Player 3 plays in game 1")
        })
        it("detect game complete, horizontal", async () => {
            await instance.newGame(accounts[0], accounts[1])

            await instance.takeTurn(0, 1)
            await instance.takeTurn(0, 0, {from: accounts[1]})
            await instance.takeTurn(0, 4)
            await instance.takeTurn(0, 0, {from: accounts[1]})
            await instance.takeTurn(0, 3)
            await instance.takeTurn(0, 0, {from: accounts[1]})
            const result = await instance.takeTurn(0, 2)
            assert.equal(result.logs.length, 2)
            assert.equal(result.logs[0].event, "NextMove")
            assert.equal(result.logs[1].event, "Victory")
            assert.equal(result.logs[1].args.gameId.valueOf(), 0, "Game ID should be 0")
            assert.equal(result.logs[1].args.winner.valueOf(), accounts[0], "Wrong victor")

            // might as well test this here. Can't move after game over
            try {
                await instance.takeTurn(0, 1, {from: accounts[1]})
            } catch (e) {
                assert.equal(e.message, "VM Exception while processing transaction: revert Game Over")
            }
        })
        it("detect game complete, diagonal", async () => {
            await instance.newGame(accounts[0], accounts[1])

            await instance.takeTurn(0, 3)
            await instance.takeTurn(0, 3, {from: accounts[1]})
            await instance.takeTurn(0, 3)
            await instance.takeTurn(0, 3, {from: accounts[1]})
            await instance.takeTurn(0, 1)
            await instance.takeTurn(0, 1, {from: accounts[1]})
            await instance.takeTurn(0, 2)
            await instance.takeTurn(0, 0, {from: accounts[1]})
            await instance.takeTurn(0, 2)
            const result = await instance.takeTurn(0, 2, {from: accounts[1]})
            assert.equal(result.logs.length, 2)
            assert.equal(result.logs[0].event, "NextMove")
            assert.equal(result.logs[1].event, "Victory")
            assert.equal(result.logs[1].args.gameId.valueOf(), 0, "Game ID should be 0")
            assert.equal(result.logs[1].args.winner.valueOf(), accounts[1], "Wrong victor")
        })
    })

    contract("Handle resignations", () => {
        it("first player resigns", async () => {
            await instance.newGame(accounts[0], accounts[1])

            await instance.takeTurn(0, 1)
            await instance.takeTurn(0, 0, {from: accounts[1]})

            const result = await instance.resignGame(0)
            assert.equal(result.logs.length, 1)
            assert.equal(result.logs[0].event, "Resigned")
            assert.equal(result.logs[0].args.gameId.valueOf(), 0, "Game ID should be 0")
            assert.equal(result.logs[0].args.resigner.valueOf(), accounts[0], "Wrong resigner")
        })
        it("second player resigns", async () => {
            await instance.newGame(accounts[0], accounts[1])
            await instance.takeTurn(0, 1)
            await instance.takeTurn(0, 0, {from: accounts[1]})

            const result = await instance.resignGame(0, {from: accounts[1]})
            assert.equal(result.logs.length, 1)
            assert.equal(result.logs[0].event, "Resigned")
            assert.equal(result.logs[0].args.gameId.valueOf(), 0, "Game ID should be 0")
            assert.equal(result.logs[0].args.resigner.valueOf(), accounts[1], "Wrong resigner")
        })
        it("getGamesByPlayer after resignation", async () => {
            await instance.newGame(accounts[0], accounts[1])
            await instance.newGame(accounts[0], accounts[2])

            await instance.takeTurn(0, 1)
            await instance.takeTurn(0, 0, {from: accounts[1]})
            await instance.resignGame(0)

            let games = await instance.getGamesByPlayer({from: accounts[0]})
            assert.equal(games.length, 1, "Player 1 should have one game")
            assert.equal(games[0], 1, "Player 1 plays in game 1")

            games = await instance.getGamesByPlayer({from: accounts[1]})
            assert.equal(games.length, 0, "Player 2 should have no games")

            games = await instance.getGamesByPlayer({from: accounts[2]})
            assert.equal(games.length, 1, "Player 3 should have one game")
            assert.equal(games[0], 1, "Player 3 plays in game 1")
        })
        it("third player resigns should reject", async () => {
            await instance.newGame(accounts[0], accounts[1])

            await instance.takeTurn(0, 1)
            await instance.takeTurn(0, 0, {from: accounts[1]})

            try {
                await instance.resignGame(0, {from: accounts[3]})
                assert.fail("Error not thrown")
            } catch (e) {
                assert.equal(e.message, "VM Exception while processing transaction: revert Who are you?")
            }
        })
        it("Can't resign if game over", async () => {
            await instance.newGame(accounts[0], accounts[1])

            await instance.takeTurn(0, 1)
            await instance.takeTurn(0, 0, {from: accounts[1]})
            await instance.resignGame(0, {from: accounts[0]})

            try {
                await instance.resignGame(0)
                assert.fail("Error not thrown")
            } catch (e) {
                assert.equal(e.message, "VM Exception while processing transaction: revert Game Over")
            }
        })
    })

    contract("Claim win", () => {
        it("Reject when wrong player", async () => {
            await instance.newGame(accounts[0], accounts[1])

            await instance.takeTurn(0, 1)
            await instance.takeTurn(0, 0, {from: accounts[1]})

            try {
                await instance.claimWin(0, {from: accounts[0]})
                assert.fail("Error not thrown")
            } catch (e) {
                assert.equal(e.message, "VM Exception while processing transaction: revert Cannot claim win on your move")
            }
        })
        it("Reject when claim within window", async () => {
            await instance.newGame(accounts[0], accounts[1])

            await instance.takeTurn(0, 1)
            await instance.takeTurn(0, 0, {from: accounts[1]})

            try {
                await instance.claimWin(0, {from: accounts[1]})
                assert.fail("Error not thrown")
            } catch (e) {
                assert.equal(e.message, "VM Exception while processing transaction: revert Cannot claim a win yet") 
            }
        })
        it("Can't claim win if game over", async () => {
            await instance.newGame(accounts[0], accounts[1])

            await instance.takeTurn(0, 1)
            await instance.takeTurn(0, 0, {from: accounts[1]})
            await instance.resignGame(0, {from: accounts[0]}) // game over

            try {
                await instance.claimWin(0, {from: accounts[1]})
                assert.fail("Error not thrown")
            } catch (e) {
                assert.equal(e.message, "VM Exception while processing transaction: revert Game Over") 
            }
        })
    })
})
