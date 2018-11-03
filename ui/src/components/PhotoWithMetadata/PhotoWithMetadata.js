import React, { Component, Fragment } from 'react'

import { Text, Header } from 'Components'
import { ANALOG } from 'Constants'

import {
    StyledPhoto,
    MetadataWrapper,
    PhotoWrapper,
    PhotoWithMetadataWrapper,
    Spacer,
    LoadingIcon,
    ErrorIcon
} from './PhotoWithMetadata.styles'

const PS = 'Point & Shoot Camera'
const DSLR = 'DSLR Camera'
const PHONE = 'Phone'
const FILM = 'Film Camera'

class PhotoWithMetadata extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            isError: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.details.id !== nextProps.details.id) {
            this.setState({ isLoading: true, isError: false })
        }
    }

    handleImageErrored = () => {
        this.setState({ isLoading: false, isError: true })
    }
    handleImageLoaded = () => {
        this.setState({ isLoading: false, isError: false })
    }

    render() {
        const { isLoading, isError } = this.state
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
        const gearString = make || model || lens ? `${make} ${model} ${lens}` : 'N/A'
        const statsString =
            aperture || shutter_speed || iso || focal_length
                ? `F${aperture} ${shutter_speed}" ${iso}ISO ${focal_length}mm`
                : 'N/A'

        return (
            <PhotoWithMetadataWrapper>
                {isLoading && <LoadingIcon size="5em" />}
                {isError && <ErrorIcon size="5em" />}
                <PhotoWrapper>
                    {!isError && (
                        <StyledPhoto
                            isLoading={isLoading}
                            isLandscape={width > height}
                            onLoad={this.handleImageLoaded.bind(this)}
                            onError={this.handleImageErrored.bind(this)}
                            src={src}
                            onClick={this.handleClick}
                        />
                    )}
                    {!isError &&
                        !isLoading && (
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
                                            {camera_type === ANALOG ? 'Film Camera' : gearString}
                                            <Spacer />
                                            <Header size="inline">Conditions </Header>
                                            {camera_type === ANALOG ? 'N/A' : statsString}
                                        </Fragment>
                                    )}
                                </Text>
                            </MetadataWrapper>
                        )}
                </PhotoWrapper>
            </PhotoWithMetadataWrapper>
        )
    }
}

export default PhotoWithMetadata
