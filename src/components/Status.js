import React, { Component } from "react"
import { connect } from "react-redux"

const mapStateToProps = state => {
    return {
        errorMessage: state.errorMessage,
        statusMessages: state.statusMessages
    }
}

class Status extends Component {
    render() {
        let index = 0
        const { statusMessages, errorMessage } = this.props
        const sms = statusMessages.map(msg => <span key={index++}>{msg}</span>)

        return (
            <div>
                <div id="statusMsg">{sms}</div>
                <div id="errorMsg">{errorMessage}</div>
            </div>
        )
    }
}

export default connect(mapStateToProps)(Status)
