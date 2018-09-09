import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { ThumbnailWrapper } from './Thumbnail.styles'

class Thumbnail extends Component {
    handleClick = () => {
        const { id, setLargePhoto } = this.props
        setLargePhoto(id)
    }

    render() {
        const { src } = this.props

        return <ThumbnailWrapper src={src} onClick={this.handleClick} />
    }
}

Thumbnail.propTypes = {
    src: PropTypes.string.isRequired,
    setLargePhoto: PropTypes.func.isRequired
}

export default Thumbnail
