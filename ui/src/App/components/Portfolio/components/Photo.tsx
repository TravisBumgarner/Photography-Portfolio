import * as React from 'react'
import styled from 'styled-components'
import { FaCamera, FaTimes, FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa'

import { Text, Header } from 'sharedComponents'
import { PhotoType } from 'sharedTypes'
import { ICON_FONT_SIZES, ICON_COLOR, APP_BORDER } from "theme";

const FILM = 'Film'
const CONTROLS_WRAPPER_HEIGHT = '50px';
const TOP_ROW = '20px';

const CloseIcon = styled(FaTimes)`
    position: fixed;
    right: 20px;
    top: ${TOP_ROW};
    z-index: 999;
    fill: ${ICON_COLOR.initial};

    &:hover {
        fill: ${ICON_COLOR.hover};
    }
`

const PreviousButton = styled(FaArrowCircleLeft)`
    left: 20px;
    fill: ${ICON_COLOR.initial};

    &:hover {
        fill: ${ICON_COLOR.hover};
    }
`
const NextButton = styled(FaArrowCircleRight)`
    fill: ${ICON_COLOR.initial};
    cursor: pointer;

    &:hover {
        fill: ${ICON_COLOR.hover};
    }
`

const MetadataButton = styled.button`
    border-radius: 5px;
    background-color: black;
    color: white;
    border: solid black;
    padding: 5px;
    cursor: pointer;
`

const LoadingIcon = styled(FaCamera)`
    position: fixed;
    top: calc(50vh - 2.5em);
    left: calc(50vw - 2.5em);
    `

const Spacer = styled(({ className }) => <span className={className}>//</span>)`
    padding: 0 20px;
    display: inline-block;
    font-weight: 700;
`

const PhotoWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100vw - ${APP_BORDER} * 2);
    height: calc(100vh - ${APP_BORDER} * 2);
`

const ControlsWrapper = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex; 
    justify-content: center;
    width: 100%;
    background: rgba(255,255,255, 0.7);
    padding: 10px;
    height: ${CONTROLS_WRAPPER_HEIGHT};
    box-sizing: border-box;

    & > * {
        margin: 0 20px;
    }
`

const MetadataWrapper = styled.div`
    width: 80%;
    margin: 0 10%;
    text-align: center;
    position: absolute;
    top: ${TOP_ROW};
    left: 0;
    background-color: rgba(255,255,255,0.7);
    
    & > * {
        font-size: 14px;
        padding: 0;
    }
`

const StyledPhoto = styled.img`
    max-width: 100%;
    max-height: calc(100% - ${CONTROLS_WRAPPER_HEIGHT} * 2);
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
                        {location}
                        <Spacer />
                        {camera_type.toLowerCase() === 'film' ? 'Film Camera' : gearString}
                        <Spacer />
                        {camera_type.toLowerCase() === 'film' ? 'N/A' : statsString}
                    </>
                )}
            </Text>
        </MetadataWrapper>
    )
}

type PhotoProps = {
    photos: { [id: string]: PhotoType }
    filteredPhotoIds: string[]
    selectedFilteredPhotoIndex: number
    setSelectedFilteredPhotoIndex: React.Dispatch<React.SetStateAction<number>>
}

const Photo = ({ photos, filteredPhotoIds, selectedFilteredPhotoIndex, setSelectedFilteredPhotoIndex }: PhotoProps) => {
    const [isLoading, setIsLoading] = React.useState(true)
    const [showMetadata, toggleShowMetadata] = React.useState(true)
    React.useEffect(() => setIsLoading(true), [])

    const details = photos[filteredPhotoIds[selectedFilteredPhotoIndex]]

    const getNextPhotoIndex = (direction: 'left' | 'right') => {
        const first = 0
        const last = filteredPhotoIds.length - 1
        let next

        if (direction === 'left') {
            next = selectedFilteredPhotoIndex - 1
            if (next < first) {
                next = last
            }
        } else {
            next = selectedFilteredPhotoIndex + 1
            if (next > last) {
                next = first
            }
        }
        setSelectedFilteredPhotoIndex(next)
    }

    const exitSinglePhotoView = () => {
        setSelectedFilteredPhotoIndex(undefined)
    }

    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "ArrowLeft") {
            getNextPhotoIndex('left');
        } else if (event.key === "ArrowRight") {
            getNextPhotoIndex('right');
        } else if (event.key === "Escape") {
            exitSinglePhotoView();
        }
    };

    React.useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [selectedFilteredPhotoIndex]);

    return (
        <div>
            <CloseIcon size={ICON_FONT_SIZES.l} onClick={exitSinglePhotoView} />
            {isLoading ? <LoadingIcon size="5em" /> : null}
            <PhotoWrapper>
                <StyledPhoto
                    onLoad={() => setIsLoading(false)}
                    src={`https://storage.googleapis.com/photo21/photos/large/${details.src}`}
                />
            </PhotoWrapper>
            {!isLoading && showMetadata ? <Metadata details={details} /> : ''}
            {!isLoading
                ? (
                    <ControlsWrapper>
                        <PreviousButton size={ICON_FONT_SIZES.l} onClick={() => getNextPhotoIndex('left')} />
                        <MetadataButton onClick={() => toggleShowMetadata(!showMetadata)}>Toggle Metadata</MetadataButton>
                        <NextButton size={ICON_FONT_SIZES.l} onClick={() => getNextPhotoIndex('right')} />
                    </ControlsWrapper>
                )
                : ''
            }

        </div>
    )
}


export default Photo
