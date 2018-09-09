const initialState = {
    highlightedCol: null,
    selectedCol: null
}

export default (state = initialState, action) => {
    switch (action.type) {
        case "HIGHLIGHTED_GRID_COL":
            return {
               ...state,
               highlightedCol: action.column
            }
        case "SELECTED_GRID_COL":
            return {
                ...state,
                selectedCol: action.column
            }
        case "BOARD_DESELECT":
            return {
                ...state,
                highlightedCol: null
            }
        case "NEXT_MOVE_RECEIVED":
            return {
                ...state,
                selectedCol: null
            }
        default:
            return state
    }
}
