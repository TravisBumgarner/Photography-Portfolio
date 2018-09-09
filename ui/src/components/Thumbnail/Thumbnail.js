import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { ThumbnailWrapper } from './Thumbnail.styles'

class Thumbnail extends Component {
    handleClick = () => {
        const { index, setSelectedPhotoIndex } = this.props
        setSelectedPhotoIndex(index)
    }

    render() {
        const { src } = this.props

        return <ThumbnailWrapper src={src} onClick={this.handleClick} />
    }
}

Thumbnail.propTypes = {
    src: PropTypes.string.isRequired,
    setSelectedPhotoIndex: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired
}

export default Thumbnail
