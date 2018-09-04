export const newGame = players => ({
    type: "NEW_GAME",
    players
})

export const nextMove = (gameId, column) => ({
    type: "NEXT_MOVE",
    move: { gameId, column }
})
