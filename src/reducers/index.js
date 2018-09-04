import initialState from "./initialState"

const reducer = (state = initialState, action) => {
    console.log("REDUCER ", action)
    switch (action.type) {
        case "NEW_GAME":
            return action.players
        case "NEXT_MOVE":
            return action.move
        default:
            return state
    }
}

export default reducer
