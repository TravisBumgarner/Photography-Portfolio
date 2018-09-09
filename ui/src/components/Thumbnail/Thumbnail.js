import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { ThumbnailWrapper } from './Thumbnail.styles'

class Thumbnail extends Component {
    render() {
        const { src, color1, color2 } = this.props

        return <ThumbnailWrapper src={src} color1={color1} color2={color2} />
    }
}

Thumbnail.propTypes = {
    src: PropTypes.string.isRequired
}

export default Thumbnail
