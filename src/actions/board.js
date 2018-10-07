export const selectedGridCol = column => ({
    type: "SELECTED_GRID_COL",
    column
})

export const highlightedGridCol = column => ({
    type: "HIGHLIGHTED_GRID_COL",
    column
})

export const boardDeselect = () => ({
    type: "BOARD_DESELECT"
})
