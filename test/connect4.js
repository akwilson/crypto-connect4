const Connect4 = artifacts.require("./Connect4.sol")

contract('Connect4', accounts => {
    let instance

    beforeEach(async () => {
        instance = await Connect4.new()
    })

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

        const newGame = await instance.games(0)
        assert.equal(newGame[2], false, "New game should not be over")
        assert.equal(newGame[3], false, "Player 2 should be next")
    })
    it("should reject move outside board size", async () => {
        await instance.newGame(accounts[0], accounts[1])

        try {
            await instance.takeTurn(0, 9)
            assert.fail("Error not thrown")
        } catch(e) {
            assert.equal(e.message, "VM Exception while processing transaction: revert")
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
        } catch(e) {
            assert.equal(e.message, "VM Exception while processing transaction: revert")
        }
    })
    it("should detect game complete", async () => {
        await instance.newGame(accounts[0], accounts[1])

        await instance.takeTurn(0, 0)
        await instance.takeTurn(0, 1, {from: accounts[1]})
        await instance.takeTurn(0, 0)
        await instance.takeTurn(0, 1, {from: accounts[1]})
        await instance.takeTurn(0, 0)
        await instance.takeTurn(0, 1, {from: accounts[1]})
        const result = await instance.takeTurn(0, 0)
        assert.equal(result.logs.length, 2)
        assert.equal(result.logs[0].event, "NextMove")
        assert.equal(result.logs[1].event, "GameOver")
    })
})
