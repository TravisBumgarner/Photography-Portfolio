import React, { Fragment } from 'react'
import { Redirect } from 'react-router-dom'

import { Thumbnail, PhotoWithMetadata } from './components'
import { Header, Text } from 'sharedComponents'
import { ICON_FONT_SIZES } from 'theme'
import { parseContent } from 'utilities'
import { PhotoType, GalleryType } from 'sharedTypes'

import {
    GalleryWrapper,
    GalleryItem,
    PreviousButton,
    NextButton,
    PhotoWithMetadataWrapper,
    CloseIcon,
    ProjectDescriptionWrapper,
    NextContainer,
    PreviousContainer
} from './Gallery.styles'

const ITEMS_PER_ROW = 3

type GenerateGridProps = {
    visibleImageCount: number,
    photos: PhotoType[],
    handleSwitchToSelectedPhoto: (newSelectedPhotoIndex: number | undefined) => void
}

const generateGrid = ({ visibleImageCount, photos, handleSwitchToSelectedPhoto }: GenerateGridProps) => {
    const grid = photos.slice(0, visibleImageCount).map((photo, index) => (
        <GalleryItem key={photo.id}>
            <Thumbnail
                src={photo.src}
                index={index}
                handleSwitchToSelectedPhoto={handleSwitchToSelectedPhoto}
            />
        </GalleryItem>
    ))

    // Add blank elements so last row of photos is spaced correctly.
    while (grid.length % ITEMS_PER_ROW !== 0) {
        const modulous = grid.length % ITEMS_PER_ROW
        grid.push(<GalleryItem key={`blank${modulous}`} />)
    }

    return grid
}

type Props = {
    photoId: string,
    galleryDetails: GalleryType,
    history: any,
    photos: PhotoType[]
}

const Gallery = ({
    photoId,
    galleryDetails,
    history,
    photos
}: Props) => {
    const [visibleImageCount, setVisibleImageCount] = React.useState<number>(15)
    const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState<number | undefined>(undefined)
    const galleryRef = React.useRef<HTMLInputElement>(null)

    const onScroll = React.useCallback(() => {
        const node = galleryRef.current
        if (
            node &&
            node.clientHeight !== 0 &&
            visibleImageCount < photos.length &&
            window.innerHeight + window.scrollY >= node.clientHeight - 250
        ) {
            setVisibleImageCount(visibleImageCount + 12)
        }
    }, [photos, visibleImageCount])

    React.useEffect(() => {
        window.addEventListener('scroll', onScroll)
        return () => {
            window.removeEventListener('scroll', onScroll)
        }
    }, [onScroll])

    const getPreviousPhotoIndex = () => {
        if (selectedPhotoIndex === undefined) {
            return
        }

        const newSelectedPhotoIndex = selectedPhotoIndex === 0 ? photos.length - 1 : selectedPhotoIndex - 1
        setSelectedPhotoIndex(newSelectedPhotoIndex)
        handleUrlChange(newSelectedPhotoIndex)
    }

    const getNextPhotoIndex = () => {
        if (selectedPhotoIndex === undefined) {
            return
        }

        const newSelectedPhotoIndex = selectedPhotoIndex === photos.length - 1 ? 0 : selectedPhotoIndex + 1
        setSelectedPhotoIndex(newSelectedPhotoIndex)
        handleUrlChange(newSelectedPhotoIndex)
    }

    const handleKeyPress = (event: KeyboardEvent) => {
        if (selectedPhotoIndex === undefined) {
            return
        }

        if (event.key === 'ArrowLeft') {
            getPreviousPhotoIndex()
        } else if (event.key === 'ArrowRight') {
            getNextPhotoIndex()
        } else if (event.key === 'Escape') {
            handleSwitchToGrid()
        }
    }

    React.useEffect(() => {
        window.addEventListener('keydown', handleKeyPress)
        return () => {
            window.removeEventListener('keydown', handleKeyPress)
        }
    }, [selectedPhotoIndex])

    const handleSwitchToSelectedPhoto = (newSelectedPhotoIndex: number) => {
        setSelectedPhotoIndex(newSelectedPhotoIndex)
        handleUrlChange(newSelectedPhotoIndex)
    }

    const handleSwitchToGrid = () => {
        setSelectedPhotoIndex(undefined)
        handleUrlChange(undefined)
    }

    const handleUrlChange = (newSelectedPhotoIndex: number | undefined) => {
        if (newSelectedPhotoIndex !== undefined) {
            const { id } = photos[newSelectedPhotoIndex]
            history.push(`/portfolio/${galleryDetails.content_type}/${galleryDetails.slug}/${id}`)
        } else {
            history.push(`/portfolio/${galleryDetails.content_type}/${galleryDetails.slug}`)
        }
    }

    const grid = generateGrid({ visibleImageCount, photos, handleSwitchToSelectedPhoto })

    const getSelectedPhotoFromUrl = () => {
        if (photoId !== undefined) {
            let indexFound
            photos.forEach((photo, index) => {
                if (photo.id === photoId) {
                    indexFound = index
                }
            })
            if (indexFound !== undefined) {
                setSelectedPhotoIndex(indexFound)
            }
        }
    }

    React.useEffect(getSelectedPhotoFromUrl, [photos])

    if (!photos.length) {
        return null
    }
    return (
        selectedPhotoIndex !== undefined ? (
            <PhotoWithMetadataWrapper>
                <CloseIcon size={ICON_FONT_SIZES.l} onClick={handleSwitchToGrid} />
                <PreviousContainer onClick={getPreviousPhotoIndex}>
                    <PreviousButton size={ICON_FONT_SIZES.l} />
                </PreviousContainer>
                <NextContainer onClick={getNextPhotoIndex}>
                    <NextButton size={ICON_FONT_SIZES.l} />
                </NextContainer>
                <PhotoWithMetadata details={photos[selectedPhotoIndex]} />
            </PhotoWithMetadataWrapper>
        ) : (
                <Fragment>
                    <ProjectDescriptionWrapper>
                        <Header size="medium">{galleryDetails.title}</Header>
                        {parseContent(galleryDetails.description)}
                        {galleryDetails.content_type == 'Project' && (
                            <Text>{`${galleryDetails.start_date} - ${galleryDetails.end_date}`}</Text>
                        )}
                    </ProjectDescriptionWrapper>
                    <GalleryWrapper ref={galleryRef}>{grid}</GalleryWrapper>
                </Fragment>
            )
    )
}

export default Gallery
