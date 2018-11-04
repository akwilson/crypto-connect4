const Connect4 = artifacts.require("./Connect4.sol")
const Web3 = require("web3");
const BigNumber = require("bignumber.js")

contract('Connect4', accounts => {
    const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
    let instance

    contract("Main tests, standard board", () => {
        beforeEach(async () => {
            instance = await Connect4.new(7, 6, 4, 30, web3.utils.toWei("0.01", "ether"), { from: accounts[3] })
        })
        contract("Play game", () => {
            it("should create a new game", async () => {
                const result = await instance.newGame(accounts[1])
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
                await instance.newGame(accounts[1])

                const result = await instance.takeTurn(0, 3, { value: web3.utils.toWei("0.01", "ether") })
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
            it("legal move should update account balances", async () => {
                await instance.newGame(accounts[1])
                const accBalPre = await web3.eth.getBalance(accounts[0])
                // set gas price to 1 wei. gas cost is therefore gasUsed * 1
                const txn = await instance.takeTurn(0, 3, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })

                const accBalPost = await web3.eth.getBalance(accounts[0])
                const actual = new BigNumber(accBalPost)
                const expected = new BigNumber(accBalPre).minus(new BigNumber(txn.receipt.gasUsed).plus(new BigNumber(web3.utils.toWei("0.01", "ether"))))
                assert.ok(actual.isEqualTo(expected), "Player balance incorrect")

                const cBal = await web3.eth.getBalance(instance.contract.address)
                assert.equal(cBal, web3.utils.toWei("0.01", "ether"), "Wrong contract address amount")
            })
            it("should reject if wrong balance sent accross", async () => {
                await instance.newGame(accounts[1])
                try {
                    await instance.takeTurn(0, 3, { value: web3.utils.toWei("1", "ether") })
                    assert.fail("Error not thrown")
                } catch (e) {
                    assert.equal(e.message, "VM Exception while processing transaction: revert Incorrect balance transferred")
                }
            })
            it("should reject if no balance sent accross", async () => {
                await instance.newGame(accounts[1])
                try {
                    await instance.takeTurn(0, 3)
                    assert.fail("Error not thrown")
                } catch (e) {
                    assert.equal(e.message, "VM Exception while processing transaction: revert Incorrect balance transferred")
                }
            })
            it("should reject move outside board size", async () => {
                await instance.newGame(accounts[1])

                try {
                    await instance.takeTurn(0, 9, { value: web3.utils.toWei("0.01", "ether") })
                    assert.fail("Error not thrown")
                } catch (e) {
                    assert.equal(e.message, "VM Exception while processing transaction: revert Illegal move")
                }
            })
            it("should reject if column is full", async () => {
                await instance.newGame(accounts[1])

                await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                try {
                    await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether") })
                    assert.fail("Error not thrown")
                } catch (e) {
                    assert.equal(e.message, "VM Exception while processing transaction: revert Column full")
                }
            })
            it("getBoard for single game", async () => {
                await instance.newGame(accounts[1])
                await instance.newGame(accounts[2])

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
                await instance.newGame(accounts[1])
                // used to test getGamesByPlayer()
                await instance.newGame(accounts[2])

                await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 1, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 1, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 1, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })

                // test victory detection
                const result = await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether") })
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
            it("victory payouts", async () => {
                await instance.newGame(accounts[1])

                const winBalPre = await web3.eth.getBalance(accounts[0])
                const ownBalPre = await web3.eth.getBalance(accounts[3])
                let gasUsed = new BigNumber(0)

                let txn = await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
                gasUsed = gasUsed.plus(new BigNumber(txn.receipt.gasUsed))
                await instance.takeTurn(0, 1, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                txn = await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
                gasUsed = gasUsed.plus(new BigNumber(txn.receipt.gasUsed))
                await instance.takeTurn(0, 1, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                txn = await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
                gasUsed = gasUsed.plus(new BigNumber(txn.receipt.gasUsed))
                await instance.takeTurn(0, 1, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                txn = await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
                gasUsed = gasUsed.plus(new BigNumber(txn.receipt.gasUsed))

                // contract should have 0 balance
                const cBal = await web3.eth.getBalance(instance.contract.address)
                assert.equal(cBal, "0", "Contract should have 0 balance")

                // contract owner gets 10%
                const ownBalPost = await web3.eth.getBalance(accounts[3])
                const obActual = new BigNumber(ownBalPost)
                const obExpected = new BigNumber(ownBalPre).plus(new BigNumber(web3.utils.toWei("0.007", "ether")))
                assert.ok(obActual.isEqualTo(obExpected), "Wrong contract owner balance")

                // victor gets payout
                const winBalPost = await web3.eth.getBalance(accounts[0])
                const wbActual = new BigNumber(winBalPost)
                const wbExpected = new BigNumber(winBalPre).plus(new BigNumber(web3.utils.toWei("0.03", "ether"))).minus(gasUsed).minus(web3.utils.toWei("0.007", "ether"))
                assert.ok(wbActual.isEqualTo(wbExpected), "Wrong victory payout")
            })
            it("detect game complete, horizontal", async () => {
                await instance.newGame(accounts[1])

                await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 4, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 3, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                const result = await instance.takeTurn(0, 2, { value: web3.utils.toWei("0.01", "ether") })
                assert.equal(result.logs.length, 2)
                assert.equal(result.logs[0].event, "NextMove")
                assert.equal(result.logs[1].event, "Victory")
                assert.equal(result.logs[1].args.gameId.valueOf(), 0, "Game ID should be 0")
                assert.equal(result.logs[1].args.winner.valueOf(), accounts[0], "Wrong victor")

                // might as well test this here. Can't move after game over
                try {
                    await instance.takeTurn(0, 1, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                } catch (e) {
                    assert.equal(e.message, "VM Exception while processing transaction: revert Game Over")
                }
            })
            it("detect game complete, diagonal", async () => {
                await instance.newGame(accounts[1])

                await instance.takeTurn(0, 3, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 3, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 3, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 3, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 1, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 2, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 2, { value: web3.utils.toWei("0.01", "ether") })
                const result = await instance.takeTurn(0, 2, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
                assert.equal(result.logs.length, 2)
                assert.equal(result.logs[0].event, "NextMove")
                assert.equal(result.logs[1].event, "Victory")
                assert.equal(result.logs[1].args.gameId.valueOf(), 0, "Game ID should be 0")
                assert.equal(result.logs[1].args.winner.valueOf(), accounts[1], "Wrong victor")
            })
        })

        contract("Handle resignations", () => {
            it("first player resigns", async () => {
                await instance.newGame(accounts[1])

                await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })

                const result = await instance.resignGame(0)
                assert.equal(result.logs.length, 1)
                assert.equal(result.logs[0].event, "Resigned")
                assert.equal(result.logs[0].args.gameId.valueOf(), 0, "Game ID should be 0")
                assert.equal(result.logs[0].args.resigner.valueOf(), accounts[0], "Wrong resigner")
            })
            it("second player resigns", async () => {
                await instance.newGame(accounts[1])

                await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })

                const result = await instance.resignGame(0, {from: accounts[1]})
                assert.equal(result.logs.length, 1)
                assert.equal(result.logs[0].event, "Resigned")
                assert.equal(result.logs[0].args.gameId.valueOf(), 0, "Game ID should be 0")
                assert.equal(result.logs[0].args.resigner.valueOf(), accounts[1], "Wrong resigner")
            })
            it("payouts when second player resigns", async () => {
                await instance.newGame(accounts[1])

                const winBalPre = await web3.eth.getBalance(accounts[0])
                const ownBalPre = await web3.eth.getBalance(accounts[3])
                let gasUsed = new BigNumber(0)

                let txn = await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
                gasUsed = gasUsed.plus(new BigNumber(txn.receipt.gasUsed))
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
                txn = await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
                gasUsed = gasUsed.plus(new BigNumber(txn.receipt.gasUsed))
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })

                await instance.resignGame(0, { from: accounts[1] })

                // victor gets payout
                const winBalPost = await web3.eth.getBalance(accounts[0])
                const wbActual = new BigNumber(winBalPost)
                const wbExpected = new BigNumber(winBalPre).plus(new BigNumber(web3.utils.toWei("0.02", "ether"))).minus(gasUsed).minus(web3.utils.toWei("0.004", "ether"))
                assert.ok(wbActual.isEqualTo(wbExpected), "Wrong victory payout")

                // contract should have 0 balance
                const cBal = await web3.eth.getBalance(instance.contract.address)
                assert.equal(cBal, "0", "Contract should have 0 balance")

                // contract owner gets 10%
                const ownBalPost = await web3.eth.getBalance(accounts[3])
                const obActual = new BigNumber(ownBalPost)
                const obExpected = new BigNumber(ownBalPre).plus(new BigNumber(web3.utils.toWei("0.004", "ether")))
                assert.ok(obActual.isEqualTo(obExpected), "Wrong contract owner balance")
            })
            it("payouts when first player resigns", async () => {
                await instance.newGame(accounts[1])

                const winBalPre = await web3.eth.getBalance(accounts[1])
                const ownBalPre = await web3.eth.getBalance(accounts[3])
                let gasUsed = new BigNumber(0)

                await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
                let txn = await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
                gasUsed = gasUsed.plus(new BigNumber(txn.receipt.gasUsed))
                await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
                txn = await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
                gasUsed = gasUsed.plus(new BigNumber(txn.receipt.gasUsed))

                await instance.resignGame(0)

                // victor gets payout
                const winBalPost = await web3.eth.getBalance(accounts[1])
                const wbActual = new BigNumber(winBalPost)
                const wbExpected = new BigNumber(winBalPre).plus(new BigNumber(web3.utils.toWei("0.02", "ether"))).minus(gasUsed).minus(web3.utils.toWei("0.004", "ether"))
                assert.ok(wbActual.isEqualTo(wbExpected), "Wrong victory payout")

                // contract should have 0 balance
                const cBal = await web3.eth.getBalance(instance.contract.address)
                assert.equal(cBal, "0", "Contract should have 0 balance")

                // contract owner gets 10%
                const ownBalPost = await web3.eth.getBalance(accounts[3])
                const obActual = new BigNumber(ownBalPost)
                const obExpected = new BigNumber(ownBalPre).plus(new BigNumber(web3.utils.toWei("0.004", "ether")))
                assert.ok(obActual.isEqualTo(obExpected), "Wrong contract owner balance")
            })
            it("getGamesByPlayer after resignation", async () => {
                await instance.newGame(accounts[1])
                await instance.newGame(accounts[2])

                await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
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
                await instance.newGame(accounts[1])

                await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })

                try {
                    await instance.resignGame(0, {from: accounts[3]})
                    assert.fail("Error not thrown")
                } catch (e) {
                    assert.equal(e.message, "VM Exception while processing transaction: revert Who are you?")
                }
            })
            it("Can't resign if game over", async () => {
                await instance.newGame(accounts[1])

                await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
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
                await instance.newGame(accounts[1])

                await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })

                try {
                    await instance.claimWin(0, {from: accounts[0]})
                    assert.fail("Error not thrown")
                } catch (e) {
                    assert.equal(e.message, "VM Exception while processing transaction: revert Cannot claim win on your move")
                }
            })
            it("Reject when claim within window", async () => {
                await instance.newGame(accounts[1])

                await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })

                try {
                    await instance.claimWin(0, {from: accounts[1]})
                    assert.fail("Error not thrown")
                } catch (e) {
                    assert.equal(e.message, "VM Exception while processing transaction: revert Cannot claim a win yet") 
                }
            })
            it("Can't claim win if game over", async () => {
                await instance.newGame(accounts[1])

                await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether") })
                await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
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

    contract("Detects draw", () => {
        beforeEach(async () => {
            instance = await Connect4.new(3, 3, 4, 30, web3.utils.toWei("0.01", "ether"))
        })
        it("detects draw when grid is full and no winner", async () => {
            await instance.newGame(accounts[1])

            await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether") })
            await instance.takeTurn(0, 1, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
            await instance.takeTurn(0, 2, { value: web3.utils.toWei("0.01", "ether") })
            await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
            await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether") })
            await instance.takeTurn(0, 2, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })
            await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether") })
            await instance.takeTurn(0, 1, { from: accounts[1], value: web3.utils.toWei("0.01", "ether") })

            const result = await instance.takeTurn(0, 2, { value: web3.utils.toWei("0.01", "ether") })
            assert.equal(result.logs.length, 2)
            assert.equal(result.logs[0].event, "NextMove")
            assert.equal(result.logs[1].event, "Draw")
        })
        it("draw repays players (minus gas)", async () => {
            await instance.newGame(accounts[1])

            const p1BalPre = await web3.eth.getBalance(accounts[0])
            const p2BalPre = await web3.eth.getBalance(accounts[1])
            const ownBalPre = await web3.eth.getBalance(accounts[3])
            let p1GasUsed = new BigNumber(0)
            let p2GasUsed = new BigNumber(0)

            let txn = await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
            p1GasUsed = p1GasUsed.plus(new BigNumber(txn.receipt.gasUsed))
            txn = await instance.takeTurn(0, 1, { from: accounts[1], value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
            p2GasUsed = p2GasUsed.plus(new BigNumber(txn.receipt.gasUsed))
            txn = await instance.takeTurn(0, 2, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
            p1GasUsed = p1GasUsed.plus(new BigNumber(txn.receipt.gasUsed))
            txn = await instance.takeTurn(0, 0, { from: accounts[1], value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
            p2GasUsed = p2GasUsed.plus(new BigNumber(txn.receipt.gasUsed))
            txn = await instance.takeTurn(0, 1, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
            p1GasUsed = p1GasUsed.plus(new BigNumber(txn.receipt.gasUsed))
            txn = await instance.takeTurn(0, 2, { from: accounts[1], value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
            p2GasUsed = p2GasUsed.plus(new BigNumber(txn.receipt.gasUsed))
            txn = await instance.takeTurn(0, 0, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
            p1GasUsed = p1GasUsed.plus(new BigNumber(txn.receipt.gasUsed))
            txn = await instance.takeTurn(0, 1, { from: accounts[1], value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
            p2GasUsed = p2GasUsed.plus(new BigNumber(txn.receipt.gasUsed))
            txn = await instance.takeTurn(0, 2, { value: web3.utils.toWei("0.01", "ether"), gasPrice: "1" })
            p1GasUsed = p1GasUsed.plus(new BigNumber(txn.receipt.gasUsed))

            const p1BalPost = await web3.eth.getBalance(accounts[0])
            const p1Actual = new BigNumber(p1BalPost)
            const p1Expected = new BigNumber(p1BalPre).minus(p1GasUsed)
            assert.ok(p1Actual.isEqualTo(p1Expected), "Wrong draw payout, p1")

            const p2BalPost = await web3.eth.getBalance(accounts[1])
            const p2Actual = new BigNumber(p2BalPost)
            const p2Expected = new BigNumber(p2BalPre).minus(p2GasUsed)
            assert.ok(p2Actual.isEqualTo(p2Expected), "Wrong draw payout, p2")

            const ownBalPost = await web3.eth.getBalance(accounts[3])
            const ownActual = new BigNumber(ownBalPost)
            const ownExpected = new BigNumber(ownBalPre)
            assert.ok(ownActual.isEqualTo(ownExpected), "Owner balance should not change")

            const cBal = await web3.eth.getBalance(instance.contract.address)
            assert.equal(cBal, "0", "Contract should have 0 balance")
        })
    })
})
