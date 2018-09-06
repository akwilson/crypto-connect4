import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import { Provider } from "react-redux"
import { createStore, applyMiddleware } from "redux"
import rootReducer from "./reducers"
import App from "./components/App"
import c4w3Redux from "./c4w3Redux"
import registerServiceWorker from "./registerServiceWorker"

const middleware = applyMiddleware(c4w3Redux)
const store = createStore(rootReducer, middleware)

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root"))

registerServiceWorker()
