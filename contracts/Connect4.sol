pragma solidity ^0.4.23;

contract Connect4 {
    event NextMove(uint indexed gameId, address player, uint8 x, uint8 y);
    event GameOver(uint indexed gameId, address winner);
    event NewGame(address indexed player1, address indexed player2, uint gameId);

    uint boardWidth = 7;
    uint boardHeight = 6;
    uint winCount = 4;

    struct Game {
        address player1;
        address player2;
        bool isOver;
        bool isPlayer1Next;
        uint8[6][7] usedTiles;
    }

    Game[] public games;

    function _isLegalMove(Game _game, uint8 _x) private view returns(bool) {
        return !_game.isOver && _x < boardWidth;
    }

    function _isOnBoard(int8 _x, int8 _y) private view returns(bool) {
        return (_x >= 0 && _x < int8(boardWidth) && _y >= 0 && _y < int8(boardHeight));
    }

    function _findSame(Game _game, uint8 _x, uint8 _y, int8[4] _adjustments) private view returns(bool) {
        uint8 target = _game.usedTiles[_x][_y];
        uint8 count = 1;
        int8 nx = int8(_x) + _adjustments[0];
        int8 ny = int8(_y) + _adjustments[1];

        while (_isOnBoard(nx, ny) && _game.usedTiles[uint8(nx)][uint8(ny)] == target) {
            count++;
            nx = nx + _adjustments[0];
            ny = ny + _adjustments[1];
        }

        nx = int8(_x) + _adjustments[2];
        ny = int8(_y) + _adjustments[3];
        while (_isOnBoard(nx, ny) && _game.usedTiles[uint8(nx)][uint8(ny)] == target) {
            count++;
            nx = nx + _adjustments[2];
            ny = ny + _adjustments[3];
        }

        return count >= winCount;
    }

    function _isGameOver(Game _game, uint8 _x, uint8 _y) private view returns(bool) {
        return (_findSame(_game, _x, _y, [int8(-1), 0, 1, 0]) ||
                _findSame(_game, _x, _y, [int8(-1), -1, 1, 1]) ||
                _findSame(_game, _x, _y, [int8(-1), 1, 1, -1]) ||
                _findSame(_game, _x, _y, [int8(0), -1, 0, 1]));
    }

    function newGame(address _player1, address _player2) public {
        Game memory game;
        game.player1 = _player1;
        game.player2 = _player2;
        game.isOver = false;
        game.isPlayer1Next = true;

        uint id = games.push(game) - 1;
        emit NewGame(game.player1, game.player2, id);
    }

    function takeTurn(uint _gameId, uint8 _x) public {
        Game storage game = games[_gameId];
        address nextMover = game.isPlayer1Next ? game.player1 : game.player2;
        require(msg.sender == nextMover, "Not your move");
        require(_isLegalMove(game, _x), "Illegal move");

        // find y axis: first non used tile on column
        uint8 y;
        for (y = 0; y <= boardHeight; y++) {
            if (y == boardHeight || game.usedTiles[_x][y] == 0) {
                break;
            }
        }

        require(y < boardHeight, "Column full");

        game.usedTiles[_x][y] = game.isPlayer1Next ? 1 : 2;
        game.isPlayer1Next = !game.isPlayer1Next;

        emit NextMove(_gameId, msg.sender, _x, y);
        if (_isGameOver(game, _x, y)) {
            game.isOver = true;
            emit GameOver(_gameId, msg.sender);
        }

        // V2
        // make payable
    }

    function getBoard(uint _gameId) public view returns(uint8[6][7]) {
        return games[_gameId].usedTiles;
    }
}
