import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Text } from 'Components'

import {
    StyledPhoto,
    MetadataWrapper,
    PhotoWrapper,
    PhotoWithMetadataWrapper
} from './PhotoWithMetadata.styles'

class Photo extends Component {
    render() {
        const {
            details: {
                src,
                width,
                height,
                make,
                model,
                aperture,
                shutter_speed,
                iso,
                lens,
                focal_length,
                location
            }
        } = this.props

        return (
            <PhotoWithMetadataWrapper>
                <PhotoWrapper>
                    <StyledPhoto
                        isLandscape={width > height}
                        src={src}
                        onClick={this.handleClick}
                    />
                    <MetadataWrapper>
                        <Text>{`${location}`}</Text>
                        <Text>{`${make} ${model}  ${lens}`}</Text>
                        <Text>
                            {`F${aperture} ${shutter_speed}" ${iso}ISO ${focal_length}mm`}
                        </Text>
                    </MetadataWrapper>
                </PhotoWrapper>
            </PhotoWithMetadataWrapper>
        )
    }
}

Photo.propTypes = {
    details: PropTypes.object.isRequired
}

export default Photo
