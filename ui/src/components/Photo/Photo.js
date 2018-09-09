import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { StyledPhoto } from './Photo.styles'

class Photo extends Component {
    render() {
        const { src } = this.props

        return <StyledPhoto src={src} onClick={this.handleClick} />
    }
}

Photo.propTypes = {
    src: PropTypes.string.isRequired,
}

export default Photo
