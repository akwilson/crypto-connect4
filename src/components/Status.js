import React, { Component } from "react"
import { connect } from "react-redux"

const mapStateToProps = state => { return { errorMessage: state.errorMessage } }

class Status extends Component {
    render() {
        const errorMessage = this.props.errorMessage
        console.log(this.props)

        return (
            <div id="errorMsg">{errorMessage}</div>
        )
    }
}

export default connect(mapStateToProps)(Status)
