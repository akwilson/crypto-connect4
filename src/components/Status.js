import React, { Component } from "react"
import { connect } from "react-redux"

const mapStateToProps = state => {
    return {
        errorMessage: state.pageUI.errorMessage,
        statusMessages: state.pageUI.statusMessages
    }
}

class Status extends Component {
    render() {
        let index = 0
        const { statusMessages, errorMessage } = this.props
        const sms = statusMessages.map(msg => <div key={index++}>{msg}</div>)

        return (
            <div>
                <div id="statusMsg">{sms}</div>
                <div id="errorMsg">{errorMessage}</div>
            </div>
        )
    }
}

export default connect(mapStateToProps)(Status)
