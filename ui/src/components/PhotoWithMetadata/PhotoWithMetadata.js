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
            details: { src, width, height }
        } = this.props

        return (
            <PhotoWithMetadataWrapper>
                <PhotoWrapper>
                    <StyledPhoto isLandscape={width > height } src={src} onClick={this.handleClick} />
                </PhotoWrapper>

                <MetadataWrapper>
                    Foo and Barr and Bazz and Buzz
                </MetadataWrapper>
            </PhotoWithMetadataWrapper>
        )
    }
}

Photo.propTypes = {
    details: PropTypes.object.isRequired
}

export default Photo
