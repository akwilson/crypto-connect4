import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { createStore, applyMiddleware } from "redux"
import thunk from "redux-thunk"
import logger from "redux-logger"

import rootReducer from "./reducers"
import App from "./components/App"
import c4w3Redux from "./c4w3Redux"
import registerServiceWorker from "./registerServiceWorker"

import "./index.css"

const middleware = applyMiddleware(c4w3Redux, thunk, logger)
const store = createStore(rootReducer, middleware)

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root"))

registerServiceWorker()
