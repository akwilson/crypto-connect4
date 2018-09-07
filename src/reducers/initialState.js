export default {
    accounts: {
        player: "",
        oppenent: ""
    },
    game: {
        boardDef: {
            height: 6,
            width: 7,
            tileSize: 45
        },
        grid: {
            highlightedCol: null,
            selectedCol: null
        },
        playerMove: true
    },
    statusMessages: [],
    errorMessage: "",
    web3Initialised: false
}
