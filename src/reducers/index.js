import { combineReducers } from "redux"

import pageUI from "./pageUI"
import board from "./board"
import gamePlay from "./gamePlay"

export default combineReducers({
    pageUI,
    board,
    gamePlay
})
