import React, { Fragment } from 'react'
import styled, { keyframes } from 'styled-components'

import { Text, Header } from 'sharedComponents'
import { PhotoType } from 'sharedTypes'
import { MEDIA, CONTENT_SPACING } from 'Theme'

const FILM = 'Film'

const StyledPhoto = styled.img`
    max-width: 100%;
    max-height: 95%;
`

const PhotoWithMetadataWrapper = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;
    padding: 0;
    height: 100vh;
    box-sizing: border-box;
`

const Spacer = styled(({ className }) => <span className={className}>//</span>)`
    padding: 0 20px;
    display: inline-block;
    font-weight: 700;
`

const PhotoWrapper = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-sizing: border-box;
    margin: 0;

    ${MEDIA.phone`
        height: 100%;
        margin: 0 ${CONTENT_SPACING.m};
    `};
`

const MetadataWrapper = styled.div`
    width: 100%;
    height: 10%;
    text-align: center;
    ${MEDIA.phone`
        display: none;
    `};
`

const Metadata = ({ details }: { details: PhotoType }) => {
    const {
        make,
        model,
        aperture,
        shutter_speed,
        iso,
        lens,
        focal_length,
        location,
        camera_type
    } = details

    const gearString = make || model || lens ? `${make} ${model} ${lens}` : 'N/A'
    const statsString =
        aperture || shutter_speed || iso || focal_length
            ? `F${aperture} ${shutter_speed}" ${iso}ISO ${focal_length}mm`
            : 'N/A'

    return (
        <MetadataWrapper>
            <Text>
                {camera_type === FILM ? (
                    'Film Camera, N/A'
                ) : (
                        <Fragment>
                            <Header size="inline">Location </Header>
                            {location}
                            <Spacer />
                            <Header size="inline">Gear </Header>
                            {camera_type.toLowerCase() === 'film' ? 'Film Camera' : gearString}
                            <Spacer />
                            <Header size="inline">Conditions </Header>
                            {camera_type.toLowerCase() === 'film' ? 'N/A' : statsString}
                        </Fragment>
                    )}
            </Text>
        </MetadataWrapper>
    )
}

const PhotoWithMetadata = ({ details }: { details: PhotoType }) => {
    return (
        <PhotoWithMetadataWrapper>
            <PhotoWrapper>
                <StyledPhoto
                    src={`https://storage.googleapis.com/photo21/photos/large/${details.src}`}
                />
                <Metadata details={details} />
            </PhotoWrapper>
        </PhotoWithMetadataWrapper>
    )
}

export default PhotoWithMetadata
