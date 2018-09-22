import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Text, Header } from 'Components'

import { StyledPhoto, MetadataWrapper, PhotoWrapper, PhotoWithMetadataWrapper, Spacer } from './PhotoWithMetadata.styles'

class PhotoWithMetadata extends Component {
    render() {
        const {
            details: { src, width, height, make, model, aperture, shutter_speed, iso, lens, focal_length, location }
        } = this.props

        const locationString = `${location}`
        const gearString = `${make} ${model}  ${lens}`
        const statsString = `F${aperture} ${shutter_speed}" ${iso}ISO ${focal_length}mm`

        return (
            <PhotoWithMetadataWrapper>
                <PhotoWrapper>
                    <StyledPhoto isLandscape={width > height} src={src} onClick={this.handleClick} />
                    <MetadataWrapper>
                        <Text>
                            <Header size="inline">Location: </Header>
                            {locationString}
                            <Spacer />
                            <Header size="inline">Gear: </Header>
                            {gearString}
                            <Spacer />
                            <Header size="inline">Conditions: </Header>
                            {statsString}
                        </Text>
                    </MetadataWrapper>
                </PhotoWrapper>
            </PhotoWithMetadataWrapper>
        )
    }
}

PhotoWithMetadata.propTypes = {
    details: PropTypes.object.isRequired
}

export default PhotoWithMetadata
