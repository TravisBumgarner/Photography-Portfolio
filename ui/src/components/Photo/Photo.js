import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {} from '..'

import { PhotoWrapper } from './Photo.styles'

class Photo extends Component {
    render() {
        const { src, color1, color2 } = this.props

        return <PhotoWrapper src={src} color1={color1} color2={color2} />
    }
}

Photo.propTypes = {
    src: PropTypes.string.isRequired
}

export default Photo
