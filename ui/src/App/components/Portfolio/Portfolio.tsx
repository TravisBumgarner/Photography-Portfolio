import * as React from 'react'

import { GalleryType, PhotoType } from 'sharedTypes'
import { Gallery } from './components'
import PhotoWithMetadataTempWrapper from './components/PhotoWithMetadata'

const ALL_GALLERY: GalleryType = {
    content_type: 'snapshot',
    slug: 'all',
    title: 'All'
}


type Props = {
    match: {
        params: {
            contentType: string
            gallerySlug: string
            photoId: string
        }
    },
    photos: PhotoType[],
    galleries: GalleryType[],
    history: any
}

const Portfolio = (
    {
        match: {
            params: { contentType, gallerySlug, photoId }
        },
        photos,
        galleries,
        history
    }: Props
) => {
    const [filteredPhotos, setFilteredPhotos] = React.useState<PhotoType[]>([])
    const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState<
        number | undefined
    >(undefined);

    const filterPhotos = () => {
        if (contentType === 'snapshot' && gallerySlug === 'all') {
            const filteredPhotos = photos.filter(photo => photo.gallery.content_type == 'snapshot')
            setFilteredPhotos(filteredPhotos)
        } else {
            const filteredPhotos = photos.filter(photo => photo.gallery.slug == gallerySlug)
            setFilteredPhotos(filteredPhotos)
        }
    }

    React.useEffect(filterPhotos, [contentType, gallerySlug])

    const getSelectedPhotoFromUrl = () => {
        if (photoId !== undefined) {
            let indexFound;
            photos.forEach((photo, index) => {
                if (photo.id === photoId) {
                    indexFound = index;
                }
            });
            if (indexFound !== undefined) {
                setSelectedPhotoIndex(indexFound);
            }
        }
    };

    React.useEffect(getSelectedPhotoFromUrl, [photos]);

    const handleUrlChange = (newSelectedPhotoIndex: number | undefined) => {
        if (newSelectedPhotoIndex !== undefined) {
            const { id } = photos[newSelectedPhotoIndex];
            history.push(
                `/portfolio/${galleryDetails.content_type}/${galleryDetails.slug}/${id}`
            );
        } else {
            history.push(
                `/portfolio/${galleryDetails.content_type}/${galleryDetails.slug}`
            );
        }
    };

    let galleryDetails = galleries.length && galleries.find(gallery => gallery.slug == gallerySlug)
    galleryDetails = galleryDetails || ALL_GALLERY

    const getPreviousPhotoIndex = () => {
        if (selectedPhotoIndex === undefined) {
            return;
        }

        const newSelectedPhotoIndex =
            selectedPhotoIndex === 0 ? photos.length - 1 : selectedPhotoIndex - 1;
        setSelectedPhotoIndex(newSelectedPhotoIndex);
        handleUrlChange(newSelectedPhotoIndex);
    };

    const getNextPhotoIndex = () => {
        if (selectedPhotoIndex === undefined) {
            return;
        }

        const newSelectedPhotoIndex =
            selectedPhotoIndex === photos.length - 1 ? 0 : selectedPhotoIndex + 1;
        setSelectedPhotoIndex(newSelectedPhotoIndex);
        handleUrlChange(newSelectedPhotoIndex);
    };

    const handleSwitchToSelectedPhoto = (newSelectedPhotoIndex: number) => {
        setSelectedPhotoIndex(newSelectedPhotoIndex);
        handleUrlChange(newSelectedPhotoIndex);
    };

    const handleSwitchToGrid = () => {
        setSelectedPhotoIndex(undefined);
        handleUrlChange(undefined);
    };

    return selectedPhotoIndex
        ? (
            <PhotoWithMetadataTempWrapper
                getNextPhotoIndex={getNextPhotoIndex}
                getPreviousPhotoIndex={getPreviousPhotoIndex}
                selectedPhotoIndex={selectedPhotoIndex}
                handleSwitchToGrid={handleSwitchToGrid}
                photos={photos}
            />
        ) : (
            <Gallery
                handleSwitchToSelectedPhoto={handleSwitchToSelectedPhoto}
                history={history}
                photoId={photoId}
                photos={filteredPhotos}
                galleryDetails={galleryDetails}
            />
        )
}

export default Portfolio
