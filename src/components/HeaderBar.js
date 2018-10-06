import React, { Component } from "react"
import logo from "../connect4.svg"

class HeaderBar extends Component {
    render() {
        return (
            <div className="my-2 col-3 offset-4" >
                <h4>
                    <img src={logo} width="28" height="28" alt="Connect 4 Logo"/>
                    <span className="ml-2">Crypto Connect 4</span>
                </h4>
            </div>
        )
    }
}

export default HeaderBar
