import * as React from 'react'
import styled from 'styled-components'
import { FaCamera, FaTimes, FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa'

import { Text, Header } from 'sharedComponents'
import { PhotoType } from 'sharedTypes'
import { RACE_CONDITION_MAGIC_NUMBER } from './Gallery/Gallery.styles'
import { ICON_FONT_SIZES, ICON_COLOR } from "theme";

const FILM = 'Film'

const CloseIcon = styled(FaTimes)`
    position: fixed;
    right: 20px;
    top: 20px;
    z-index: 999;
    fill: ${ICON_COLOR.initial};

    &:hover {
        fill: ${ICON_COLOR.hover};
    }
`

const StyledPhoto = styled.img`
    max-width: 100%;
    max-height: 90%;
    z-index: ${RACE_CONDITION_MAGIC_NUMBER + 1};
`

const PreviousButton = styled(FaArrowCircleLeft)`
    position: fixed;
    top: calc(50vh - 1rem);
    left: 20px;
    fill: ${ICON_COLOR.initial};

    &:hover {
        fill: ${ICON_COLOR.hover};
    }
`
const NextButton = styled(FaArrowCircleRight)`
    position: fixed;
    top: calc(50vh - 1rem);
    right: 20px;
    fill: ${ICON_COLOR.initial};

    &:hover {
        fill: ${ICON_COLOR.hover};
    }
`

const PreviousContainer = styled.div`
    position: absolute;
    display: flex;
    left: 0;
    top: 0;
    width: 50%;
    height: 100%;
    cursor: w-resize;
    z-index: ${RACE_CONDITION_MAGIC_NUMBER + 2};
`

const NextContainer = styled.div`
    position: absolute;
    display: flex;
    right: 0;
    top: 0;
    width: 50%;
    height: 100%;
    cursor: e-resize;
    z-index: ${RACE_CONDITION_MAGIC_NUMBER + 2};
`

const LoadingIcon = styled(FaCamera)`
    position: fixed;
    top: calc(50vh - 2.5em);
    left: calc(50vw - 2.5em);
    z-index: ${RACE_CONDITION_MAGIC_NUMBER};
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
`

const MetadataWrapper = styled.div`
    width: 100%;
    height: 10%;
    text-align: center;
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
                    <>
                        <Header size="inline">Location </Header>
                        {location}
                        <Spacer />
                        <Header size="inline">Gear </Header>
                        {camera_type.toLowerCase() === 'film' ? 'Film Camera' : gearString}
                        <Spacer />
                        <Header size="inline">Conditions </Header>
                        {camera_type.toLowerCase() === 'film' ? 'N/A' : statsString}
                    </>
                )}
            </Text>
        </MetadataWrapper>
    )
}

const PhotoWithMetadata = ({ details, selectedPhotoIndex, getPreviousPhotoIndex, getNextPhotoIndex, handleSwitchToGrid }: { details: PhotoType } & any) => {
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        setIsLoading(true)
    }, [])

    const handleKeyPress = (event: KeyboardEvent) => {
        if (selectedPhotoIndex === undefined) {
            return;
        }

        if (event.key === "ArrowLeft") {
            getPreviousPhotoIndex();
        } else if (event.key === "ArrowRight") {
            getNextPhotoIndex();
        } else if (event.key === "Escape") {
            handleSwitchToGrid();
        }
    };

    React.useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [selectedPhotoIndex]);

    return (
        <PhotoWithMetadataWrapper>
            {isLoading ? <LoadingIcon size="5em" /> : null}
            <PhotoWrapper>
                <StyledPhoto
                    onLoad={() => setIsLoading(false)}
                    src={`https://storage.googleapis.com/photo21/photos/large/${details.src}`}
                />
                {isLoading ? null : <Metadata details={details} />}
            </PhotoWrapper>
        </PhotoWithMetadataWrapper>
    )
}

const PhotoWithMetadataTempWrapper = ({ selectedPhotoIndex, getNextPhotoIndex, getPreviousPhotoIndex, handleSwitchToGrid, photos }) => {
    return (
        <PhotoWithMetadataWrapper>
            <CloseIcon size={ICON_FONT_SIZES.l} onClick={handleSwitchToGrid} />
            <PreviousContainer onClick={getPreviousPhotoIndex}>
                <PreviousButton size={ICON_FONT_SIZES.l} />
            </PreviousContainer>
            <NextContainer onClick={getNextPhotoIndex}>
                <NextButton size={ICON_FONT_SIZES.l} />
            </NextContainer>
            <PhotoWithMetadata
                getPreviousPhotoIndex={getPreviousPhotoIndex}
                getNextPhotoIndex={getNextPhotoIndex}
                handleSwitchToGrid={handleSwitchToGrid}
                details={photos[selectedPhotoIndex]}
                selectedPhotoIndex={selectedPhotoIndex}
            />
        </PhotoWithMetadataWrapper>
    )
}

export default PhotoWithMetadataTempWrapper
