import React, { Component } from "react"
import logo from "../connect4.svg"

class HeaderBar extends Component {
    render() {
        return (
            <div className="my-2 col-3 offset-4" >
                <h3>
                    <img src={logo} width="20" height="20"/>
                    <span className="ml-2">Crypto Connect 4</span>
                </h3>
            </div>
        )
    }
}

export default HeaderBar
