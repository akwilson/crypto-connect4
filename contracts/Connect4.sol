pragma solidity ^0.4.23;

contract Connect4 {
    event NextMove(uint indexed gameId, address player, bool isPlayer1Next, uint8 x, uint8 y);
    event Victory(uint indexed gameId, address winner);
    event Resigned(uint indexed gameId, address resigner);
    event Draw(uint indexed gameId);
    event NewGame(address indexed player1, address indexed player2, uint gameId);

    uint8 boardWidth;
    uint8 boardHeight;
    uint8 winCount;
    uint claimWindow;
    uint payAmount;
    address public owner;

    struct Game {
        address player1;
        address player2;
        bool isOver;
        bool isPlayer1Next;
        uint8[6][7] usedTiles;
        uint32 claimTime;
        uint p1Amount;
        uint p2Amount;
    }

    Game[] public games;
    mapping(address => uint) activeGames;

    constructor(uint8 _boardWidth, uint8 _boardHeight, uint8 _winCount, uint _claimWindow, uint _payAmount) public {
        owner = msg.sender;
        boardWidth = _boardWidth;
        boardHeight = _boardHeight;
        winCount = _winCount;
        claimWindow = _claimWindow * 1 minutes;
        payAmount = _payAmount * 1 wei;
    }

    function _payoutVictory(Game _game, address winner) private {
        uint prize = _game.p1Amount + _game.p2Amount;
        uint ownerCut = prize * 10 / 100;
        owner.transfer(ownerCut);
        winner.transfer(prize - ownerCut);
    }

    function _payoutDraw(Game _game) private {
        /*
        uint p1Cut = _game.p1Amount * 10 / 100;
        uint p2Cut = _game.p2Amount * 10 / 100;
        _game.player1.transfer(_game.p1Amount - p1Cut);
        _game.player2.transfer(_game.p2Amount - p2Cut);
        owner.transfer(p1Cut + p2Cut);
       */
        _game.player1.transfer(_game.p1Amount);
        _game.player2.transfer(_game.p2Amount);
    }

    modifier isGameActive(uint256 _gameId) {
        Game memory game = games[_gameId];
        require(!game.isOver, "Game Over");
        _;
    }

    function _markGameOver(Game storage _game) private {
        _game.isOver = true;
        activeGames[_game.player1]--;
        activeGames[_game.player2]--;
    }

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

    function _isGameDrawn(Game _game) private view returns(bool) {
        for (uint8 i = 0; i < boardWidth; i++) {
            for (uint8 j = 0; j < boardHeight; j++) {
                if (_game.usedTiles[i][j] == 0) {
                    return false;
                }
            }
        }

        return true;
    }

    function newGame(address _player2) public {
        address player1 = msg.sender;

        Game memory game;
        game.player1 = player1;
        game.player2 = _player2;
        game.isOver = false;
        game.isPlayer1Next = true;
        game.claimTime = uint32(now + claimWindow);

        uint id = games.push(game) - 1;
        activeGames[player1]++;
        activeGames[_player2]++;

        emit NewGame(game.player1, game.player2, id);
    }

    function takeTurn(uint _gameId, uint8 _x) public payable isGameActive(_gameId) {
        require(msg.value == payAmount, "Incorrect balance transferred");
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

        if (game.isPlayer1Next) {
            game.p1Amount += msg.value;
        } else {
            game.p2Amount += msg.value;
        }

        game.usedTiles[_x][y] = game.isPlayer1Next ? 1 : 2;
        game.isPlayer1Next = !game.isPlayer1Next;
        game.claimTime = uint32(now + claimWindow);

        emit NextMove(_gameId, msg.sender, game.isPlayer1Next, _x, y);
        if (_isGameOver(game, _x, y)) {
            _markGameOver(game);
            _payoutVictory(game, msg.sender);
            emit Victory(_gameId, msg.sender);
        } else if (_isGameDrawn(game)) {
            _markGameOver(game);
            _payoutDraw(game);
            emit Draw(_gameId);
        }

        // V2
        // make payable
    }

    function resignGame(uint _gameId) public isGameActive(_gameId) {
        Game storage game = games[_gameId];
        require(msg.sender == game.player1 || msg.sender == game.player2, "Who are you?");

        _markGameOver(game);
        _payoutVictory(game, msg.sender == game.player1 ? game.player2 : game.player1);
        emit Resigned(_gameId, msg.sender);
    }

    function claimWin(uint _gameId) public isGameActive(_gameId) {
        Game storage game = games[_gameId];
        address nextMover = game.isPlayer1Next ? game.player1 : game.player2;
        require(msg.sender != nextMover, "Cannot claim win on your move");
        require(game.claimTime <= now, "Cannot claim a win yet");

        _markGameOver(game);
        _payoutVictory(game, msg.sender);
        emit Victory(_gameId, msg.sender);
    }

    function getBoard(uint _gameId) public view returns(uint8[6][7]) {
        return games[_gameId].usedTiles;
    }

    function getGamesByPlayer() public view returns(uint[]) {
        uint[] memory result = new uint[](activeGames[msg.sender]);
        Game memory game;
        uint counter = 0;
        for (uint i = 0; i < games.length; i++) {
            game = games[i];
            if (!game.isOver && (game.player1 == msg.sender || game.player2 == msg.sender)) {
                result[counter] = i;
                counter++;
            }
        }

        return result;
    }
}
