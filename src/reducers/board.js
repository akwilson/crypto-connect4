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
        default:
            return state
    }
}
