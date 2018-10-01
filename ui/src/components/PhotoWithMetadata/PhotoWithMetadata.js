import React, { Component, Fragment } from 'react'

import { Text, Header } from 'Components'
import { ANALOG } from 'Constants'

import {
    StyledPhoto,
    MetadataWrapper,
    PhotoWrapper,
    PhotoWithMetadataWrapper,
    Spacer
} from './PhotoWithMetadata.styles'

const PS = 'Point & Shoot Camera'
const DSLR = 'DSLR Camera'
const PHONE = 'Phone'
const FILM = 'Film Camera'

class PhotoWithMetadata extends Component {
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
                location,
                camera_type
            }
        } = this.props

        const locationString = `${location.title}`
        const gearString = `${make} ${model}  ${lens}`
        const statsString = `F${aperture} ${shutter_speed}" ${iso}ISO ${focal_length}mm`
        console.log(this.props)
        return (
            <PhotoWithMetadataWrapper>
                <PhotoWrapper>
                    <StyledPhoto isLandscape={width > height} src={src} onClick={this.handleClick} />
                    <MetadataWrapper>
                        <Text>
                            {camera_type === FILM ? (
                                'Film Camera, N/A'
                            ) : (
                                <Fragment>
                                    <Header size="inline">Location </Header>
                                    {locationString}
                                    <Spacer />
                                    <Header size="inline">Gear </Header>
                                    {gearString}
                                    <Spacer />
                                    <Header size="inline">Conditions </Header>
                                    {camera_type === ANALOG ? 'N/A' : statsString}
                                </Fragment>
                            )}
                        </Text>
                    </MetadataWrapper>
                </PhotoWrapper>
            </PhotoWithMetadataWrapper>
        )
    }
}

export default PhotoWithMetadata
