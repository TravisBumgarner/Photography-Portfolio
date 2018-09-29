import React, { Component } from 'react'

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

export default Thumbnail
