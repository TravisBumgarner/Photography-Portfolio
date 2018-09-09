import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
    StyledPhoto,
    MetadataWrapper,
    PhotoWrapper,
    PhotoWithMetadataWrapper
} from './PhotoWithMetadata.styles'

class Photo extends Component {
    render() {
        const {
            details: { src, width, height, location, metadata, exif_data }
        } = this.props

        // const { make, model } = JSON.parse(exif_data)

        return (
            <PhotoWithMetadataWrapper>
                <PhotoWrapper>
                    <StyledPhoto
                        isLandscape={width > height}
                        src={src}
                        onClick={this.handleClick}
                    />
                </PhotoWrapper>

                <MetadataWrapper>Location: {location}</MetadataWrapper>
            </PhotoWithMetadataWrapper>
        )
    }
}

Photo.propTypes = {
    details: PropTypes.object.isRequired
}

export default Photo
