import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {} from '..'

import { PhotoWrapper } from './Photo.styles'

class Photo extends Component {
    render() {
        const { src } = this.props

        return <PhotoWrapper src={src} />
    }
}

Photo.propTypes = {
    src: PropTypes.string.isRequired
}

export default Photo
