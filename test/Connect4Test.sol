pragma solidity ^0.4.19;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Connect4.sol";

contract Connect4Test {
    function testNewGame() public {
        Connect4 c4 = Connect4(DeployedAddresses.Connect4());
        c4.newGame(0x123);

        address p1;
        address p2;
        bool isOver;
        bool np;
        uint32 t;
        (p1, p2, isOver, np, t) = c4.games(0);

        Assert.equal(p2, 0x123, "New game created: player 2 address");
        Assert.equal(isOver, false, "New game created: game over");
        Assert.equal(np, true, "New game created: player 1 next");
    }
}
